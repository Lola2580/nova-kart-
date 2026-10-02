const API_URL = "http://localhost:5000";

let wishlistData = [];
let selectedProduct = null;


/* =========================
   GET TOKEN
========================= */

function getToken() {
    return localStorage.getItem("token");
}


/* =========================
   LOAD WISHLIST
========================= */

async function loadWishlist() {

    const token = getToken();

    const container =
        document.getElementById("wishlistProducts");

    const emptyWishlist =
        document.getElementById("emptyWishlist");


    if (!container) {

        console.error(
            "wishlistProducts element not found"
        );

        return;

    }


    if (!token) {

        container.innerHTML = `
            <div class="wishlist-loading">

                Please login to view your wishlist.

                <br><br>

                <a href="login.html">
                    Login
                </a>

            </div>
        `;

        if (emptyWishlist) {
            emptyWishlist.style.display = "none";
        }

        updateWishlistCount(0);

        return;
    }


    try {

        container.innerHTML = `
            <div class="wishlist-loading">

                <div class="loading-spinner"></div>

                <p>
                    Loading your wishlist...
                </p>

            </div>
        `;


        const response = await fetch(
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

            window.location.href =
                "login.html";

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


        wishlistData =
            data.wishlist || [];


        renderWishlist(
            wishlistData
        );


        updateWishlistCount(
            wishlistData.length
        );


        await updateCartCount();


    } catch (error) {

        console.error(
            "Wishlist Error:",
            error
        );


        container.innerHTML = `
            <div class="success-error">

                ❌
                ${escapeHTML(
                    error.message
                )}

            </div>
        `;

    }

}


/* =========================
   RENDER WISHLIST
========================= */

function renderWishlist(items) {

    const container =
        document.getElementById(
            "wishlistProducts"
        );

    const emptyWishlist =
        document.getElementById(
            "emptyWishlist"
        );


    if (!items.length) {

        container.innerHTML = "";


        if (emptyWishlist) {

            emptyWishlist.style.display =
                "flex";

        }


        updateWishlistCount(0);

        return;

    }


    if (emptyWishlist) {

        emptyWishlist.style.display =
            "none";

    }


    container.innerHTML =
        items.map(
            item =>
                createWishlistCard(
                    item
                )
        ).join("");


    updateWishlistCount(
        items.length
    );

}


/* =========================
   CREATE CARD
========================= */

function createWishlistCard(item) {

    const productId =
        Number(
            item.product_id
        );


    const stock =
        Number(
            item.stock || 0
        );


    const image =
        item.image_url ||
        "https://via.placeholder.com/500x500?text=No+Image";


    return `

        <article
            class="wishlist-card"
            data-product-id="${productId}"
        >

            <div class="wishlist-image-wrap">

                <img
                    class="wishlist-image"
                    src="${escapeAttribute(image)}"
                    alt="${escapeAttribute(
                        item.name
                    )}"
                    onerror="
                        this.src='https://via.placeholder.com/500x500?text=No+Image'
                    "
                >


                ${
                    item.category
                    ? `
                        <span class="wishlist-category">
                            ${escapeHTML(
                                item.category
                            )}
                        </span>
                    `
                    : ""
                }


                <button
                    class="remove-wishlist-btn"
                    type="button"
                    onclick="
                        removeFromWishlist(
                            ${productId}
                        )
                    "
                >
                    ♥
                </button>

            </div>


            <div class="wishlist-content">

                ${
                    item.category
                    ? `
                        <div class="category-text">
                            ${escapeHTML(
                                item.category
                            )}
                        </div>
                    `
                    : ""
                }


                <h2 class="wishlist-name">
                    ${escapeHTML(
                        item.name
                    )}
                </h2>


                <p class="wishlist-description">
                    ${escapeHTML(
                        item.description ||
                        "No description available."
                    )}
                </p>


                <div class="wishlist-price-row">

                    <strong class="wishlist-price">
                        ₹${formatPrice(
                            item.price
                        )}
                    </strong>


                    <span
                        class="
                            wishlist-stock
                            ${
                                stock <= 0
                                    ? "out"
                                    : ""
                            }
                        "
                    >
                        ${
                            stock > 0
                                ? `${stock} In Stock`
                                : "Out of Stock"
                        }
                    </span>

                </div>


                <div class="wishlist-actions">

                    <button
                        class="
                            wishlist-action-btn
                            wishlist-view-btn
                        "
                        type="button"
                        onclick="
                            openWishlistProduct(
                                ${productId}
                            )
                        "
                    >
                        View
                    </button>


                    <button
                        class="
                            wishlist-action-btn
                            wishlist-cart-btn
                        "
                        type="button"
                        ${
                            stock <= 0
                                ? "disabled"
                                : ""
                        }
                        onclick="
                            addWishlistToCart(
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
   REMOVE WISHLIST
========================= */

async function removeFromWishlist(
    productId
) {

    const token = getToken();


    if (!token) {

        window.location.href =
            "login.html";

        return;

    }


    try {

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
                "Unable to remove wishlist item"
            );

        }


        wishlistData =
            wishlistData.filter(
                item =>
                    Number(
                        item.product_id
                    ) !==
                    Number(productId)
            );


        renderWishlist(
            wishlistData
        );


    } catch (error) {

        console.error(
            "Remove Wishlist Error:",
            error
        );


        alert(
            "❌ " +
            error.message
        );

    }

}


/* =========================
   ADD TO CART
========================= */

async function addWishlistToCart(
    productId
) {

    const token = getToken();


    if (!token) {

        window.location.href =
            "login.html";

        return;

    }


    const item =
        wishlistData.find(
            product =>
                Number(
                    product.product_id
                ) ===
                Number(productId)
        );


    if (!item) {

        alert(
            "Product not found."
        );

        return;

    }


    if (
        Number(item.stock || 0) <= 0
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


        alert(
            "✅ Product added to cart!"
        );


        await updateCartCount();


    } catch (error) {

        console.error(
            "Add Cart Error:",
            error
        );


        alert(
            "❌ " +
            error.message
        );

    }

}


/* =========================
   QUICK VIEW
========================= */

function openWishlistProduct(
    productId
) {

    selectedProduct =
        wishlistData.find(
            item =>
                Number(
                    item.product_id
                ) ===
                Number(productId)
        );


    if (!selectedProduct) {
        return;
    }


    document.getElementById(
        "modalWishlistImage"
    ).src =
        selectedProduct.image_url ||
        "https://via.placeholder.com/500x500?text=No+Image";


    document.getElementById(
        "modalWishlistName"
    ).textContent =
        selectedProduct.name ||
        "Product";


    document.getElementById(
        "modalWishlistDescription"
    ).textContent =
        selectedProduct.description ||
        "No description available.";


    document.getElementById(
        "modalWishlistPrice"
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
            "modalWishlistStock"
        );


    stockElement.textContent =
        stock > 0
            ? `${stock} In Stock`
            : "Out of Stock";


    stockElement.classList.toggle(
        "out",
        stock <= 0
    );


    const modal =
        document.getElementById(
            "wishlistProductModal"
        );


    if (modal) {

        modal.classList.add(
            "show"
        );

    }

}


/* =========================
   CLOSE MODAL
========================= */

function closeWishlistModal() {

    const modal =
        document.getElementById(
            "wishlistProductModal"
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
        "closeWishlistModal"
    )
    ?.addEventListener(
        "click",
        closeWishlistModal
    );


document
    .getElementById(
        "wishlistProductModal"
    )
    ?.addEventListener(
        "click",
        event => {

            if (
                event.target.id ===
                "wishlistProductModal"
            ) {

                closeWishlistModal();

            }

        }
    );


/* =========================
   MODAL ADD TO CART
========================= */

document
    .getElementById(
        "modalAddCart"
    )
    ?.addEventListener(
        "click",
        async () => {

            if (!selectedProduct) {
                return;
            }


            await addWishlistToCart(
                selectedProduct.product_id
            );

        }
    );


/* =========================
   MODAL REMOVE
========================= */

document
    .getElementById(
        "modalRemoveWishlist"
    )
    ?.addEventListener(
        "click",
        async () => {

            if (!selectedProduct) {
                return;
            }


            await removeFromWishlist(
                selectedProduct.product_id
            );


            closeWishlistModal();

        }
    );


/* =========================
   WISHLIST SEARCH
========================= */

document
    .getElementById(
        "wishlistSearch"
    )
    ?.addEventListener(
        "input",
        filterWishlist
    );


function filterWishlist() {

    const input =
        document.getElementById(
            "wishlistSearch"
        );


    const query =
        input
            .value
            .trim()
            .toLowerCase();


    const filtered =
        wishlistData.filter(
            item => {

                const name =
                    String(
                        item.name || ""
                    ).toLowerCase();


                const description =
                    String(
                        item.description || ""
                    ).toLowerCase();


                const category =
                    String(
                        item.category || ""
                    ).toLowerCase();


                return (
                    name.includes(query) ||
                    description.includes(query) ||
                    category.includes(query)
                );

            }
        );


    renderWishlist(
        filtered
    );

}


/* =========================
   SORT
========================= */

document
    .getElementById(
        "wishlistSort"
    )
    ?.addEventListener(
        "change",
        sortWishlist
    );


function sortWishlist() {

    const select =
        document.getElementById(
            "wishlistSort"
        );


    const items = [
        ...wishlistData
    ];


    switch (
        select.value
    ) {

        case "price-low":

            items.sort(
                (a, b) =>
                    Number(a.price || 0) -
                    Number(b.price || 0)
            );

            break;


        case "price-high":

            items.sort(
                (a, b) =>
                    Number(b.price || 0) -
                    Number(a.price || 0)
            );

            break;


        case "name":

            items.sort(
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


        default:

            items.sort(
                (a, b) =>
                    new Date(
                        b.created_at || 0
                    ) -
                    new Date(
                        a.created_at || 0
                    )
            );

            break;

    }


    renderWishlist(
        items
    );

}


/* =========================
   WISHLIST COUNT
========================= */

function updateWishlistCount(
    count
) {

    const headerCount =
        document.getElementById(
            "wishlistCount"
        );


    const totalCount =
        document.getElementById(
            "wishlistTotal"
        );


    if (headerCount) {

        headerCount.textContent =
            count;

    }


    if (totalCount) {

        totalCount.textContent =
            count;

    }

}


/* =========================
   CART COUNT
========================= */

async function updateCartCount() {

    const cartCount =
        document.getElementById(
            "cartCount"
        );


    if (!cartCount) {
        return;
    }


    const token =
        getToken();


    if (!token) {

        cartCount.textContent =
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


        cartCount.textContent =
            count;


    } catch (error) {

        console.error(
            "Cart Count Error:",
            error
        );

    }

}


/* =========================
   SEARCH HEADER
========================= */

document
    .getElementById(
        "searchBtn"
    )
    ?.addEventListener(
        "click",
        () => {

            const input =
                document.getElementById(
                    "searchInput"
                );


            const query =
                input.value.trim();


            window.location.href =
                query
                    ? `shop.html?search=${encodeURIComponent(query)}`
                    : "shop.html";

        }
    );


document
    .getElementById(
        "searchInput"
    )
    ?.addEventListener(
        "keydown",
        event => {

            if (
                event.key === "Enter"
            ) {

                document
                    .getElementById(
                        "searchBtn"
                    )
                    ?.click();

            }

        }
    );


/* =========================
   SHOP NOW
========================= */

document
    .getElementById(
        "shopNowBtn"
    )
    ?.addEventListener(
        "click",
        () => {

            window.location.href =
                "shop.html";

        }
    );


/* =========================
   FORMAT PRICE
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

        loadWishlist();

    }
);