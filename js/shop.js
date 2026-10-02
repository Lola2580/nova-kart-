const API_URL = "http://localhost:5000";

let allProducts = [];
let filteredProducts = [];
let wishlistItems = [];
let selectedProduct = null;


/* =========================
   LOAD PRODUCTS
========================= */

async function loadProducts() {

    const container =
        document.getElementById("products");

    if (!container) {
        return;
    }

    try {

        container.innerHTML = `
            <div class="products-loading">
                <div class="loading-spinner"></div>
                <p>Loading products...</p>
            </div>
        `;


        const response = await fetch(
            `${API_URL}/api/products`
        );

        const data = await response.json();


        if (!response.ok) {
            throw new Error(
                data.error ||
                "Failed to load products"
            );
        }


        allProducts =
            Array.isArray(data)
                ? data
                : (data.products || []);


        filteredProducts =
            [...allProducts];


        populateCategories();

        await loadWishlist();

        applyURLSearch();

        renderProducts();

        updateProductCount();

        await updateCartCount();

    } catch (error) {

        console.error(
            "Products Error:",
            error
        );


        container.innerHTML = `
            <div class="success-error">
                ❌ ${escapeHTML(error.message)}
            </div>
        `;
    }
}


/* =========================
   LOAD WISHLIST ONCE
========================= */

async function loadWishlist() {

    const token =
        localStorage.getItem("token");


    wishlistItems = [];


    if (!token) {

        updateWishlistCount();

        return;

    }


    try {

        const response =
            await fetch(
                `${API_URL}/api/wishlist`,
                {
                    method: "GET",

                    headers: {
                        "Authorization":
                            `Bearer ${token}`
                    }
                }
            );


        if (
            response.status === 401 ||
            response.status === 403
        ) {

            localStorage.removeItem("token");

            wishlistItems = [];

            updateWishlistCount();

            return;
        }


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data.error ||
                "Unable to load wishlist"
            );
        }


        wishlistItems =
            data.wishlist || [];


        updateWishlistCount();

    } catch (error) {

        console.error(
            "Wishlist Load Error:",
            error
        );

        wishlistItems = [];

        updateWishlistCount();
    }
}


/* =========================
   CATEGORY FILTER
========================= */

function populateCategories() {

    const categoryFilter =
        document.getElementById(
            "categoryFilter"
        );


    if (!categoryFilter) {
        return;
    }


    const categories = [
        ...new Set(
            allProducts
                .map(
                    product =>
                        product.category
                )
                .filter(Boolean)
        )
    ].sort();


    categoryFilter.innerHTML = `
        <option value="all">
            All Categories
        </option>
    `;


    categories.forEach(category => {

        const option =
            document.createElement(
                "option"
            );

        option.value =
            category;

        option.textContent =
            category;

        categoryFilter.appendChild(
            option
        );

    });
}


/* =========================
   URL SEARCH
========================= */

function applyURLSearch() {

    const params =
        new URLSearchParams(
            window.location.search
        );


    const search =
        params.get("search");


    if (!search) {
        return;
    }


    const searchInput =
        document.getElementById(
            "searchInput"
        );


    if (searchInput) {
        searchInput.value =
            search;
    }


    applyFilters();
}


/* =========================
   FILTER
========================= */

function applyFilters() {

    const searchInput =
        document.getElementById(
            "searchInput"
        );

    const categoryFilter =
        document.getElementById(
            "categoryFilter"
        );


    const searchText =
        (
            searchInput?.value ||
            ""
        )
        .trim()
        .toLowerCase();


    const category =
        categoryFilter?.value ||
        "all";


    filteredProducts =
        allProducts.filter(product => {

            const name =
                String(
                    product.name || ""
                ).toLowerCase();


            const description =
                String(
                    product.description || ""
                ).toLowerCase();


            const productCategory =
                String(
                    product.category || ""
                ).toLowerCase();


            const matchesSearch =
                !searchText ||
                name.includes(searchText) ||
                description.includes(searchText) ||
                productCategory.includes(searchText);


            const matchesCategory =
                category === "all" ||
                String(
                    product.category || ""
                ) === category;


            return (
                matchesSearch &&
                matchesCategory
            );
        });


    applySort();

    renderProducts();

    updateProductCount();
}


/* =========================
   SORT
========================= */

function applySort() {

    const sort =
        document.getElementById(
            "sortFilter"
        )?.value ||
        "default";


    switch (sort) {

        case "price-low":

            filteredProducts.sort(
                (a, b) =>
                    Number(a.price || 0) -
                    Number(b.price || 0)
            );

            break;


        case "price-high":

            filteredProducts.sort(
                (a, b) =>
                    Number(b.price || 0) -
                    Number(a.price || 0)
            );

            break;


        case "name":

            filteredProducts.sort(
                (a, b) =>
                    String(
                        a.name || ""
                    ).localeCompare(
                        String(
                            b.name || ""
                        )
                    )
            );

            break;


        case "newest":

            filteredProducts.sort(
                (a, b) =>
                    new Date(
                        b.created_at || 0
                    ) -
                    new Date(
                        a.created_at || 0
                    )
            );

            break;


        default:
            break;
    }
}


/* =========================
   RENDER PRODUCTS
========================= */

function renderProducts() {

    const container =
        document.getElementById(
            "products"
        );

    const emptyProducts =
        document.getElementById(
            "emptyProducts"
        );


    if (!container) {
        return;
    }


    if (!filteredProducts.length) {

        container.innerHTML = "";

        if (emptyProducts) {
            emptyProducts.style.display =
                "flex";
        }

        return;
    }


    if (emptyProducts) {
        emptyProducts.style.display =
            "none";
    }


    container.innerHTML =
        filteredProducts
            .map(
                product =>
                    createProductCard(
                        product
                    )
            )
            .join("");


    updateWishlistButtons();
}


/* =========================
   PRODUCT CARD
========================= */

function createProductCard(product) {

    const productId =
        Number(product.id);


    const price =
        Number(
            product.price || 0
        );


    const stock =
        Number(
            product.stock || 0
        );


    const wishlisted =
        isInWishlist(productId);


    const image =
        product.image_url ||
        "https://via.placeholder.com/500x500?text=No+Image";


    return `

        <article
            class="product-card"
            data-product-id="${productId}"
        >

            <div class="product-image-wrap">

                <img
                    class="product-image"
                    src="${escapeAttribute(image)}"
                    alt="${escapeAttribute(
                        product.name
                    )}"
                    onerror="
                        this.src='https://via.placeholder.com/500x500?text=No+Image'
                    "
                >


                ${
                    product.category
                    ? `
                        <span class="product-badge">
                            ${escapeHTML(
                                product.category
                            )}
                        </span>
                    `
                    : ""
                }


                <button
                    class="
                        wishlist-btn
                        ${wishlisted ? "active" : ""}
                    "
                    type="button"
                    onclick="
                        toggleWishlist(
                            ${productId}
                        )
                    "
                    aria-label="Wishlist"
                    title="${
                        wishlisted
                            ? "Remove from Wishlist"
                            : "Add to Wishlist"
                    }"
                >
                    ${
                        wishlisted
                            ? "♥"
                            : "♡"
                    }
                </button>

            </div>


            <div class="product-content">

                ${
                    product.category
                    ? `
                        <div class="product-category">
                            ${escapeHTML(
                                product.category
                            )}
                        </div>
                    `
                    : ""
                }


                <h2 class="product-name">
                    ${escapeHTML(
                        product.name
                    )}
                </h2>


                <p class="product-description">
                    ${escapeHTML(
                        product.description ||
                        "No description available."
                    )}
                </p>


                <div class="product-price-row">

                    <strong class="product-price">
                        ₹${formatPrice(price)}
                    </strong>


                    <span
                        class="
                            product-stock
                            ${stock <= 0 ? "out" : ""}
                        "
                    >
                        ${
                            stock > 0
                                ? `${stock} In Stock`
                                : "Out of Stock"
                        }
                    </span>

                </div>


                <div class="product-actions">

                    <button
                        class="
                            product-btn
                            quick-view-btn
                        "
                        type="button"
                        onclick="
                            openProductModal(
                                ${productId}
                            )
                        "
                    >
                        View
                    </button>


                    <button
                        class="
                            product-btn
                            add-cart-btn
                        "
                        type="button"
                        ${
                            stock <= 0
                                ? "disabled"
                                : ""
                        }
                        onclick="
                            addToCart(
                                ${productId}
                            )
                        "
                    >
                        ${
                            stock > 0
                                ? "🛒 Add to Cart"
                                : "Out of Stock"
                        }
                    </button>

                </div>

            </div>

        </article>
    `;
}


/* =========================
   CHECK WISHLIST LOCALLY
========================= */

function isInWishlist(productId) {

    return wishlistItems.some(
        item =>
            Number(
                item.product_id
            ) ===
            Number(productId)
    );
}


/* =========================
   TOGGLE WISHLIST
========================= */

async function toggleWishlist(
    productId
) {

    const token =
        localStorage.getItem("token");


    if (!token) {

        const login =
            confirm(
                "Please login to use Wishlist."
            );


        if (login) {

            window.location.href =
                "login.html";

        }

        return;
    }


    const currentlyWishlisted =
        isInWishlist(productId);


    try {

        if (
            currentlyWishlisted
        ) {

            /* =====================
               REMOVE
            ===================== */

            const response =
                await fetch(
                    `${API_URL}/api/wishlist/${productId}`,
                    {
                        method: "DELETE",

                        headers: {
                            "Authorization":
                                `Bearer ${token}`
                        }
                    }
                );


            const data =
                await response.json();


            if (!response.ok) {

                throw new Error(
                    data.error ||
                    "Unable to remove from wishlist"
                );
            }


            wishlistItems =
                wishlistItems.filter(
                    item =>
                        Number(
                            item.product_id
                        ) !==
                        Number(productId)
                );


        } else {

            /* =====================
               ADD
            ===================== */

            const response =
                await fetch(
                    `${API_URL}/api/wishlist`,
                    {
                        method: "POST",

                        headers: {

                            "Content-Type":
                                "application/json",

                            "Authorization":
                                `Bearer ${token}`
                        },

                        body: JSON.stringify({
                            product_id:
                                Number(productId)
                        })
                    }
                );


            const data =
                await response.json();


            if (!response.ok) {

                throw new Error(
                    data.error ||
                    "Unable to add to wishlist"
                );
            }


            /*
             * Add returned row to local
             * memory so UI updates immediately.
             */

            const product =
                allProducts.find(
                    item =>
                        Number(item.id) ===
                        Number(productId)
                );


            wishlistItems.push({

                id:
                    data.wishlist?.id ||
                    null,

                product_id:
                    Number(productId),

                name:
                    product?.name ||
                    data.product?.name ||
                    "",

                created_at:
                    data.wishlist?.created_at ||
                    new Date().toISOString()

            });

        }


        updateWishlistButtons();

        updateWishlistCount();

        await updateModalWishlistButton();


    } catch (error) {

        console.error(
            "Wishlist Error:",
            error
        );


        alert(
            "❌ " +
            error.message
        );

    }
}


/* =========================
   UPDATE HEARTS
========================= */

function updateWishlistButtons() {

    document
        .querySelectorAll(
            ".wishlist-btn"
        )
        .forEach(button => {

            const card =
                button.closest(
                    ".product-card"
                );


            if (!card) {
                return;
            }


            const productId =
                Number(
                    card.dataset.productId
                );


            const active =
                isInWishlist(
                    productId
                );


            button.classList.toggle(
                "active",
                active
            );


            button.textContent =
                active
                    ? "♥"
                    : "♡";


            button.title =
                active
                    ? "Remove from Wishlist"
                    : "Add to Wishlist";

        });
}


/* =========================
   WISHLIST COUNT
========================= */

function updateWishlistCount() {

    const element =
        document.getElementById(
            "wishlistCount"
        );


    if (!element) {
        return;
    }


    element.textContent =
        wishlistItems.length;
}


/* =========================
   ADD TO CART
========================= */

async function addToCart(
    productId
) {

    const token =
        localStorage.getItem("token");


    if (!token) {

        const login =
            confirm(
                "Please login to add products to your cart."
            );


        if (login) {

            window.location.href =
                "login.html";

        }

        return;
    }


    const product =
        allProducts.find(
            item =>
                Number(item.id) ===
                Number(productId)
        );


    if (!product) {

        alert(
            "Product not found."
        );

        return;
    }


    if (
        Number(product.stock || 0) <= 0
    ) {

        alert(
            "This product is out of stock."
        );

        return;
    }


    try {

        const response =
            await fetch(
                `${API_URL}/api/cart`,
                {
                    method: "POST",

                    headers: {

                        "Content-Type":
                            "application/json",

                        "Authorization":
                            `Bearer ${token}`
                    },

                    body: JSON.stringify({
                        product_id:
                            Number(productId),

                        quantity: 1
                    })
                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data.error ||
                "Unable to add product to cart"
            );
        }


        await updateCartCount();


        alert(
            "✅ Product added to cart!"
        );


    } catch (error) {

        console.error(
            "Cart Error:",
            error
        );


        alert(
            "❌ " +
            error.message
        );

    }
}


/* =========================
   CART COUNT
========================= */

async function updateCartCount() {

    const element =
        document.getElementById(
            "cartCount"
        );


    if (!element) {
        return;
    }


    const token =
        localStorage.getItem("token");


    if (!token) {

        element.textContent =
            "0";

        return;
    }


    try {

        const response =
            await fetch(
                `${API_URL}/api/cart`,
                {
                    headers: {
                        "Authorization":
                            `Bearer ${token}`
                    }
                }
            );


        if (!response.ok) {
            return;
        }


        const data =
            await response.json();


        const items =
            data.cart_items || [];


        const count =
            items.reduce(
                (
                    total,
                    item
                ) =>
                    total +
                    Number(
                        item.quantity || 0
                    ),
                0
            );


        element.textContent =
            count;


    } catch (error) {

        console.error(
            "Cart Count Error:",
            error
        );

    }
}


/* =========================
   QUICK VIEW
========================= */

function openProductModal(
    productId
) {

    selectedProduct =
        allProducts.find(
            product =>
                Number(product.id) ===
                Number(productId)
        );


    if (!selectedProduct) {
        return;
    }


    const modal =
        document.getElementById(
            "productModal"
        );


    if (!modal) {
        return;
    }


    const image =
        selectedProduct.image_url ||
        "https://via.placeholder.com/500x500?text=No+Image";


    document.getElementById(
        "modalProductImage"
    ).src =
        image;


    document.getElementById(
        "modalProductImage"
    ).alt =
        selectedProduct.name ||
        "Product";


    document.getElementById(
        "modalProductName"
    ).textContent =
        selectedProduct.name ||
        "Product";


    document.getElementById(
        "modalProductDescription"
    ).textContent =
        selectedProduct.description ||
        "No description available.";


    document.getElementById(
        "modalProductPrice"
    ).textContent =
        formatPrice(
            selectedProduct.price
        );


    const stock =
        Number(
            selectedProduct.stock || 0
        );


    const stockElement =
        document.getElementById(
            "modalProductStock"
        );


    stockElement.textContent =
        stock > 0
            ? `${stock} In Stock`
            : "Out of Stock";


    stockElement.classList.toggle(
        "out",
        stock <= 0
    );


    const cartButton =
        document.getElementById(
            "modalCartBtn"
        );


    if (cartButton) {

        cartButton.disabled =
            stock <= 0;

        cartButton.textContent =
            stock > 0
                ? "🛒 Add to Cart"
                : "Out of Stock";
    }


    updateModalWishlistButton();


    modal.classList.add(
        "show"
    );
}


/* =========================
   MODAL WISHLIST
========================= */

async function updateModalWishlistButton() {

    if (!selectedProduct) {
        return;
    }


    const button =
        document.getElementById(
            "modalWishlistBtn"
        );


    if (!button) {
        return;
    }


    const active =
        isInWishlist(
            selectedProduct.id
        );


    button.textContent =
        active
            ? "♥ In Wishlist"
            : "♡ Wishlist";
}


document
    .getElementById(
        "modalWishlistBtn"
    )
    ?.addEventListener(
        "click",
        async () => {

            if (!selectedProduct) {
                return;
            }


            await toggleWishlist(
                selectedProduct.id
            );

        }
    );


/* =========================
   MODAL CART
========================= */

document
    .getElementById(
        "modalCartBtn"
    )
    ?.addEventListener(
        "click",
        async () => {

            if (!selectedProduct) {
                return;
            }


            await addToCart(
                selectedProduct.id
            );

        }
    );


/* =========================
   CLOSE MODAL
========================= */

function closeModal() {

    const modal =
        document.getElementById(
            "productModal"
        );


    if (modal) {

        modal.classList.remove(
            "show"
        );

    }


    selectedProduct =
        null;
}


document
    .getElementById(
        "closeProductModal"
    )
    ?.addEventListener(
        "click",
        closeModal
    );


document
    .getElementById(
        "productModal"
    )
    ?.addEventListener(
        "click",
        event => {

            if (
                event.target.id ===
                "productModal"
            ) {

                closeModal();

            }

        }
    );


/* =========================
   SEARCH
========================= */

document
    .getElementById(
        "searchBtn"
    )
    ?.addEventListener(
        "click",
        applyFilters
    );


document
    .getElementById(
        "searchInput"
    )
    ?.addEventListener(
        "input",
        applyFilters
    );


document
    .getElementById(
        "searchInput"
    )
    ?.addEventListener(
        "keydown",
        event => {

            if (
                event.key ===
                "Enter"
            ) {

                applyFilters();

            }

        }
    );


/* =========================
   CATEGORY
========================= */

document
    .getElementById(
        "categoryFilter"
    )
    ?.addEventListener(
        "change",
        applyFilters
    );


/* =========================
   SORT
========================= */

document
    .getElementById(
        "sortFilter"
    )
    ?.addEventListener(
        "change",
        applyFilters
    );


/* =========================
   GRID VIEW
========================= */

const productsContainer =
    document.getElementById(
        "products"
    );


document
    .getElementById(
        "gridViewBtn"
    )
    ?.addEventListener(
        "click",
        () => {

            productsContainer?.classList.remove(
                "list-view"
            );


            document
                .getElementById(
                    "gridViewBtn"
                )
                ?.classList.add(
                    "active"
                );


            document
                .getElementById(
                    "listViewBtn"
                )
                ?.classList.remove(
                    "active"
                );

        }
    );


/* =========================
   LIST VIEW
========================= */

document
    .getElementById(
        "listViewBtn"
    )
    ?.addEventListener(
        "click",
        () => {

            productsContainer?.classList.add(
                "list-view"
            );


            document
                .getElementById(
                    "listViewBtn"
                )
                ?.classList.add(
                    "active"
                );


            document
                .getElementById(
                    "gridViewBtn"
                )
                ?.classList.remove(
                    "active"
                );

        }
    );


/* =========================
   CLEAR FILTERS
========================= */

document
    .getElementById(
        "clearFiltersBtn"
    )
    ?.addEventListener(
        "click",
        () => {

            const searchInput =
                document.getElementById(
                    "searchInput"
                );


            const categoryFilter =
                document.getElementById(
                    "categoryFilter"
                );


            const sortFilter =
                document.getElementById(
                    "sortFilter"
                );


            if (searchInput) {
                searchInput.value = "";
            }


            if (categoryFilter) {
                categoryFilter.value =
                    "all";
            }


            if (sortFilter) {
                sortFilter.value =
                    "default";
            }


            filteredProducts =
                [...allProducts];


            renderProducts();

            updateProductCount();

        }
    );


/* =========================
   PRODUCT COUNT
========================= */

function updateProductCount() {

    const element =
        document.getElementById(
            "productCount"
        );


    if (element) {

        element.textContent =
            filteredProducts.length;

    }
}


/* =========================
   PRICE FORMAT
========================= */

function formatPrice(price) {

    return Number(
        price || 0
    ).toLocaleString(
        "en-IN",
        {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }
    );
}


/* =========================
   HTML SAFETY
========================= */

function escapeHTML(value) {

    const div =
        document.createElement(
            "div"
        );

    div.textContent =
        value ?? "";

    return div.innerHTML;
}


function escapeAttribute(value) {

    return escapeHTML(
        value
    );
}


/* =========================
   START
========================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        loadProducts();

    }
);