const API_URL = "http://localhost:5000";

let currentProduct = null;
let selectedColor = null;
let selectedVariant = null;
let mediaIndex = 0;


/* =========================
   URL
========================= */

const params =
    new URLSearchParams(
        window.location.search
    );

const productId =
    Number(
        params.get("id")
    );


if (!productId) {

    window.location.href =
        "shop.html";

}


/* =========================
   TOKEN
========================= */

const token =
    localStorage.getItem(
        "token"
    );


/* =========================
   LOAD PRODUCT
========================= */

async function loadProduct() {

    try {

        const response =
            await fetch(
                `${API_URL}/api/products/${productId}`
            );


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data.error ||
                "Product not found"
            );

        }


        currentProduct =
            data.product;


        renderProduct();

        renderMedia();

        renderColors();

        loadInitialColor();

        renderRelatedProducts();

        checkWishlist();

        updateCartCount();


    } catch (error) {

        console.error(
            "Product Details Error:",
            error
        );


        showError(
            error.message
        );

    }

}


/* =========================
   PRODUCT
========================= */

function renderProduct() {

    const category =
        document.getElementById(
            "productCategory"
        );

    const name =
        document.getElementById(
            "productName"
        );

    const description =
        document.getElementById(
            "productDescription"
        );

    const fullDescription =
        document.getElementById(
            "fullDescription"
        );


    if (category) {

        category.textContent =
            currentProduct.category ||
            "PRODUCT";

    }


    if (name) {

        name.textContent =
            currentProduct.name ||
            "Product";

    }


    if (description) {

        description.textContent =
            currentProduct.description ||
            "No description available.";

    }


    if (fullDescription) {

        fullDescription.textContent =
            currentProduct.description ||
            "No additional details available.";

    }


    const rating =
        Number(
            currentProduct.rating ||
            0
        );


    const reviews =
        Number(
            currentProduct.reviews_count ||
            0
        );


    const ratingElement =
        document.getElementById(
            "productRating"
        );


    const reviewElement =
        document.getElementById(
            "productReviews"
        );


    if (ratingElement) {

        ratingElement.textContent =
            `★ ${rating.toFixed(1)}`;

    }


    if (reviewElement) {

        reviewElement.textContent =
            reviews > 0
                ? `${reviews.toLocaleString("en-IN")} ratings`
                : "No ratings yet";

    }

}


/* =========================
   MEDIA
========================= */

function renderMedia() {

    const container =
        document.getElementById(
            "productMedia"
        );

    const dots =
        document.getElementById(
            "mediaDots"
        );


    if (!container) {
        return;
    }


    let media =
        Array.isArray(
            currentProduct.media
        )
            ? [...currentProduct.media]
            : [];


    /*
     * Main image first
     */

    if (
        currentProduct.image_url
    ) {

        const alreadyExists =
            media.some(
                item =>
                    item.media_url ===
                    currentProduct.image_url
            );


        if (!alreadyExists) {

            media.unshift({

                id: "main",

                media_type:
                    "image",

                media_url:
                    currentProduct.image_url,

                sort_order:
                    -1

            });

        }

    }


    container.innerHTML = "";

    if (dots) {

        dots.innerHTML = "";

    }


    if (!media.length) {

        container.innerHTML = `

            <div
                class="product-media-item"
            >
                <div class="media-empty">
                    No product image
                </div>
            </div>

        `;

        return;

    }


    media.forEach(
        (
            item,
            index
        ) => {

            const slide =
                document.createElement(
                    "div"
                );


            slide.className =
                "product-media-item";


            if (
                item.media_type ===
                "video"
            ) {

                slide.innerHTML = `

                    <video
                        controls
                        preload="metadata"
                    >

                        <source
                            src="${escapeAttribute(
                                item.media_url
                            )}"
                        >

                    </video>

                `;

            } else {

                slide.innerHTML = `

                    <img
                        src="${escapeAttribute(
                            item.media_url
                        )}"
                        alt="${escapeAttribute(
                            currentProduct.name
                        )}"
                    >

                `;

            }


            container.appendChild(
                slide
            );


            if (dots) {

                const dot =
                    document.createElement(
                        "button"
                    );


                dot.type =
                    "button";


                dot.className =
                    "media-dot";


                if (
                    index === 0
                ) {

                    dot.classList.add(
                        "active"
                    );

                }


                dot.addEventListener(
                    "click",
                    () => {

                        scrollToMedia(
                            index
                        );

                    }
                );


                dots.appendChild(
                    dot
                );

            }

        }
    );


    mediaIndex = 0;

}


/* =========================
   COLORS
========================= */

function renderColors() {

    const section =
        document.getElementById(
            "colorSection"
        );

    const container =
        document.getElementById(
            "colorOptions"
        );


    if (
        !section ||
        !container
    ) {
        return;
    }


    const colors =
        currentProduct.colors ||
        [];


    if (!colors.length) {

        section.style.display =
            "none";

        return;

    }


    section.style.display =
        "block";


    container.innerHTML =
        "";


    colors.forEach(
        color => {

            const button =
                document.createElement(
                    "button"
                );


            button.type =
                "button";


            button.className =
                "color-option";


            button.dataset.colorId =
                color.id;


            button.innerHTML = `

                ${
                    color.image_url
                        ? `
                            <img
                                src="${escapeAttribute(
                                    color.image_url
                                )}"
                                alt="${escapeAttribute(
                                    color.color_name
                                )}"
                            >
                        `
                        : `
                            <span
                                class="
                                    color-option-swatch
                                "
                                style="
                                    background:
                                    ${escapeAttribute(
                                        color.color_value ||
                                        "#ddd"
                                    )};
                                "
                            ></span>
                        `
                }

            `;


            button.addEventListener(
                "click",
                () => {

                    selectColor(
                        color
                    );

                }
            );


            container.appendChild(
                button
            );

        }
    );

}


/* =========================
   INITIAL COLOR
========================= */

function loadInitialColor() {

    const colors =
        currentProduct.colors ||
        [];


    if (!colors.length) {

        selectedColor =
            null;

        selectedVariant =
            null;

        renderVariants();

        renderPrice();

        renderStock();

        return;

    }


    selectedColor =
        colors[0];


    selectColor(
        selectedColor
    );

}


/* =========================
   SELECT COLOR
========================= */

function selectColor(
    color
) {

    selectedColor =
        color;


    /*
     * Highlight selected color
     */

    document
        .querySelectorAll(
            ".color-option"
        )
        .forEach(
            button => {

                button.classList.toggle(
                    "active",

                    Number(
                        button.dataset.colorId
                    ) ===
                    Number(
                        color.id
                    )
                );

            }
        );


    const selectedName =
        document.getElementById(
            "selectedColorName"
        );


    if (selectedName) {

        selectedName.textContent =
            color.color_name;

    }


    /*
     * Change main image
     */

    if (
        color.image_url
    ) {

        changeMainImage(
            color.image_url
        );

    }


    /*
     * Filter variants
     */

    const colorVariants =
        (
            currentProduct.variants ||
            []
        ).filter(
            variant =>
                Number(
                    variant.color_id
                ) ===
                Number(
                    color.id
                )
        );


    /*
     * Select first available
     */

    selectedVariant =
        colorVariants.find(
            variant =>
                Number(
                    variant.stock
                ) > 0
        ) || colorVariants[0] || null;


    renderVariants();

    renderPrice();

    renderStock();

}


/* =========================
   VARIANTS
========================= */

function renderVariants() {

    const section =
        document.getElementById(
            "variantSection"
        );

    const container =
        document.getElementById(
            "variantOptions"
        );


    if (
        !section ||
        !container
    ) {

        return;

    }


    const colorId =
        selectedColor?.id;


    const variants =
        (
            currentProduct.variants ||
            []
        ).filter(
            variant =>
                Number(
                    variant.color_id
                ) ===
                Number(
                    colorId
                )
        );


    if (!variants.length) {

        section.style.display =
            "none";

        return;

    }


    section.style.display =
        "block";


    container.innerHTML =
        "";


    variants.forEach(
        variant => {

            const button =
                document.createElement(
                    "button"
                );


            button.type =
                "button";


            button.className =
                "variant-option";


            const stock =
                Number(
                    variant.stock ||
                    0
                );


            const available =
                stock > 0;


            if (!available) {

                button.classList.add(
                    "out-of-stock"
                );

            }


            if (
                selectedVariant &&
                Number(
                    selectedVariant.id
                ) ===
                Number(
                    variant.id
                )
            ) {

                button.classList.add(
                    "active"
                );

            }


            const price =
                Number(
                    variant.price ||
                    0
                );


            const original =
                Number(
                    variant.original_price ||
                    0
                );


            let discount =
                0;


            if (
                original > price &&
                price > 0
            ) {

                discount =
                    Math.round(
                        (
                            (
                                original -
                                price
                            ) /
                            original
                        ) * 100
                    );

            }


            button.innerHTML = `

                <span
                    class="variant-name"
                >
                    ${escapeHTML(
                        variant.variant_name
                    )}
                </span>


                <span
                    class="variant-price-row"
                >

                    ${
                        original > price
                            ? `
                                <span
                                    class="
                                        variant-old-price
                                    "
                                >
                                    ₹${formatPrice(
                                        original
                                    )}
                                </span>
                            `
                            : ""
                    }


                    <span
                        class="
                            variant-current-price
                        "
                    >
                        ₹${formatPrice(
                            price
                        )}
                    </span>


                    ${
                        discount > 0
                            ? `
                                <span
                                    class="
                                        variant-discount
                                    "
                                >
                                    ${discount}% OFF
                                </span>
                            `
                            : ""
                    }

                </span>


                <span
                    class="variant-stock"
                >
                    ${
                        stock === 0
                            ? "Out of stock"
                            : stock <= 5
                                ? `${stock} left`
                                : "In stock"
                    }
                </span>

            `;


            if (
                available
            ) {

                button.addEventListener(
                    "click",
                    () => {

                        selectedVariant =
                            variant;


                        document
                            .querySelectorAll(
                                ".variant-option"
                            )
                            .forEach(
                                item => {

                                    item.classList.remove(
                                        "active"
                                    );

                                }
                            );


                        button.classList.add(
                            "active"
                        );


                        renderPrice();

                        renderStock();

                    }
                );

            }


            container.appendChild(
                button
            );

        }
    );

}


/* =========================
   PRICE
========================= */

function renderPrice() {

    const variant =
        selectedVariant;


    const price =
        Number(
            variant?.price ||
            currentProduct.price ||
            0
        );


    const original =
        Number(
            variant?.original_price ||
            0
        );


    const priceElement =
        document.getElementById(
            "productPrice"
        );


    const originalElement =
        document.getElementById(
            "originalPrice"
        );


    const discountElement =
        document.getElementById(
            "productDiscount"
        );


    if (priceElement) {

        priceElement.textContent =
            `₹${formatPrice(
                price
            )}`;

    }


    if (
        original > price
    ) {

        if (originalElement) {

            originalElement.textContent =
                `₹${formatPrice(
                    original
                )}`;

            originalElement.style.display =
                "inline";

        }


        if (discountElement) {

            const discount =
                Math.round(
                    (
                        (
                            original -
                            price
                        ) /
                        original
                    ) * 100
                );


            discountElement.textContent =
                `${discount}% OFF`;


            discountElement.style.display =
                "inline-block";

        }

    } else {

        if (originalElement) {

            originalElement.textContent =
                "";

            originalElement.style.display =
                "none";

        }


        if (discountElement) {

            discountElement.textContent =
                "";

            discountElement.style.display =
                "none";

        }

    }

}


/* =========================
   STOCK
========================= */

function renderStock() {

    const stockInfo =
        document.getElementById(
            "stockInfo"
        );


    const addButton =
        document.getElementById(
            "addToCartBtn"
        );


    const buyButton =
        document.getElementById(
            "buyNowBtn"
        );


    const stock =
        Number(
            selectedVariant?.stock ||
            0
        );


    if (stockInfo) {

        stockInfo.classList.remove(
            "out"
        );


        if (stock <= 0) {

            stockInfo.textContent =
                "Out of stock";

            stockInfo.classList.add(
                "out"
            );

        } else {

            stockInfo.textContent =
                stock <= 5
                    ? `Only ${stock} left in stock`
                    : "In stock";

        }

    }


    if (addButton) {

        addButton.disabled =
            stock <= 0;

    }


    if (buyButton) {

        buyButton.disabled =
            stock <= 0;

    }

}


/* =========================
   CHANGE MAIN IMAGE
========================= */

function changeMainImage(
    imageUrl
) {

    const container =
        document.getElementById(
            "productMedia"
        );


    if (!container) {
        return;
    }


    const firstImage =
        container.querySelector(
            "img"
        );


    if (firstImage) {

        firstImage.src =
            imageUrl;

    }


    container.scrollTo({

        left: 0,

        behavior:
            "smooth"

    });


    mediaIndex =
        0;


    updateMediaDots();

}


/* =========================
   MEDIA SCROLL
========================= */

function scrollToMedia(
    index
) {

    const container =
        document.getElementById(
            "productMedia"
        );


    if (!container) {
        return;
    }


    container.scrollTo({

        left:
            container.clientWidth *
            index,

        behavior:
            "smooth"

    });


    mediaIndex =
        index;


    updateMediaDots();

}


function updateMediaDots() {

    document
        .querySelectorAll(
            ".media-dot"
        )
        .forEach(
            (
                dot,
                index
            ) => {

                dot.classList.toggle(
                    "active",
                    index ===
                    mediaIndex
                );

            }
        );

}


/* =========================
   MEDIA BUTTONS
========================= */

document
    .getElementById(
        "mediaPrev"
    )
    ?.addEventListener(
        "click",
        () => {

            const slides =
                document.querySelectorAll(
                    ".product-media-item"
                );


            if (!slides.length) {
                return;
            }


            let index =
                mediaIndex - 1;


            if (index < 0) {

                index =
                    slides.length - 1;

            }


            scrollToMedia(
                index
            );

        }
    );


document
    .getElementById(
        "mediaNext"
    )
    ?.addEventListener(
        "click",
        () => {

            const slides =
                document.querySelectorAll(
                    ".product-media-item"
                );


            if (!slides.length) {
                return;
            }


            let index =
                mediaIndex + 1;


            if (
                index >=
                slides.length
            ) {

                index = 0;

            }


            scrollToMedia(
                index
            );

        }
    );


/* =========================
   WISHLIST
========================= */

document
    .getElementById(
        "wishlistBtn"
    )
    ?.addEventListener(
        "click",
        toggleWishlist
    );


async function toggleWishlist() {

    if (!token) {

        window.location.href =
            "login.html";

        return;

    }


    try {

        const button =
            document.getElementById(
                "wishlistBtn"
            );


        const active =
            button?.classList.contains(
                "active"
            );


        if (active) {

            const response =
                await fetch(
                    `${API_URL}/api/wishlist/${currentProduct.id}`,
                    {
                        method:
                            "DELETE",

                        headers: {
                            "Authorization":
                                `Bearer ${token}`
                        }
                    }
                );


            if (!response.ok) {

                throw new Error(
                    "Unable to remove wishlist item"
                );

            }


            button.classList.remove(
                "active"
            );

            button.textContent =
                "♡";


        } else {

            const response =
                await fetch(
                    `${API_URL}/api/wishlist`,
                    {
                        method:
                            "POST",

                        headers: {

                            "Content-Type":
                                "application/json",

                            "Authorization":
                                `Bearer ${token}`

                        },

                        body:
                            JSON.stringify({

                                product_id:
                                    currentProduct.id

                            })

                    }
                );


            const data =
                await response.json();


            if (!response.ok) {

                throw new Error(
                    data.error ||
                    "Unable to add wishlist item"
                );

            }


            button.classList.add(
                "active"
            );

            button.textContent =
                "♥";

        }


        updateWishlistCount();


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
   WISHLIST STATUS
========================= */

async function checkWishlist() {

    const button =
        document.getElementById(
            "wishlistBtn"
        );


    if (
        !token ||
        !button
    ) {
        return;
    }


    try {

        const response =
            await fetch(
                `${API_URL}/api/wishlist`,
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


        const exists =
            (
                data.wishlist ||
                []
            ).some(
                item =>
                    Number(
                        item.product_id
                    ) ===
                    Number(
                        currentProduct.id
                    )
            );


        if (exists) {

            button.classList.add(
                "active"
            );

            button.textContent =
                "♥";

        }

    } catch (error) {

        console.error(
            "Wishlist Check Error:",
            error
        );

    }

}


/* =========================
   ADD TO CART
========================= */

document
    .getElementById(
        "addToCartBtn"
    )
    ?.addEventListener(
        "click",
        addToCart
    );


async function addToCart() {

    if (!token) {

        window.location.href =
            "login.html";

        return;

    }


    if (
        !selectedVariant
    ) {

        alert(
            "Please select a variant."
        );

        return;

    }


    if (
        Number(
            selectedVariant.stock
        ) <= 0
    ) {

        alert(
            "This variant is out of stock."
        );

        return;

    }


    const button =
        document.getElementById(
            "addToCartBtn"
        );


    button.disabled =
        true;


    button.textContent =
        "Adding...";


    try {

        const response =
            await fetch(
                `${API_URL}/api/cart`,
                {
                    method:
                        "POST",

                    headers: {

                        "Content-Type":
                            "application/json",

                        "Authorization":
                            `Bearer ${token}`

                    },

                    body:
                        JSON.stringify({

                            product_id:
                                currentProduct.id,

                            quantity:
                                1

                        })

                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data.error ||
                "Unable to add to cart"
            );

        }


        alert(
            "✅ Product added to cart!"
        );


        updateCartCount();


    } catch (error) {

        console.error(
            "Add Cart Error:",
            error
        );


        alert(
            "❌ " +
            error.message
        );

    } finally {

        button.disabled =
            false;

        button.textContent =
            "Add to Cart";

        renderStock();

    }

}


/* =========================
   BUY NOW
========================= */

document
    .getElementById(
        "buyNowBtn"
    )
    ?.addEventListener(
        "click",
        buyNow
    );


async function buyNow() {

    if (!token) {

        window.location.href =
            "login.html";

        return;

    }


    if (
        !selectedVariant
    ) {

        alert(
            "Please select a variant."
        );

        return;

    }


    if (
        Number(
            selectedVariant.stock
        ) <= 0
    ) {

        alert(
            "This variant is out of stock."
        );

        return;

    }


    const button =
        document.getElementById(
            "buyNowBtn"
        );


    button.disabled =
        true;


    button.textContent =
        "Preparing...";


    try {

        const response =
            await fetch(
                `${API_URL}/api/cart`,
                {
                    method:
                        "POST",

                    headers: {

                        "Content-Type":
                            "application/json",

                        "Authorization":
                            `Bearer ${token}`

                    },

                    body:
                        JSON.stringify({

                            product_id:
                                currentProduct.id,

                            quantity:
                                1

                        })

                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data.error ||
                "Unable to prepare checkout"
            );

        }


        window.location.href =
            "checkout.html";


    } catch (error) {

        console.error(
            "Buy Now Error:",
            error
        );


        alert(
            "❌ " +
            error.message
        );


        button.disabled =
            false;

        button.textContent =
            "Buy Now";

    }

}


/* =========================
   SHARE
========================= */

document
    .getElementById(
        "shareBtn"
    )
    ?.addEventListener(
        "click",
        shareProduct
    );


async function shareProduct() {

    try {

        const shareData = {

            title:
                currentProduct.name,

            text:
                currentProduct.description ||
                "Check out this product on NovaCart.",

            url:
                window.location.href

        };


        if (
            navigator.share
        ) {

            await navigator.share(
                shareData
            );

        } else {

            await navigator.clipboard.writeText(
                window.location.href
            );


            alert(
                "✅ Product link copied!"
            );

        }

    } catch (error) {

        console.log(
            "Share cancelled"
        );

    }

}


/* =========================
   RELATED PRODUCTS
========================= */

async function renderRelatedProducts() {

    const container =
        document.getElementById(
            "relatedProducts"
        );


    if (!container) {
        return;
    }


    try {

        const response =
            await fetch(
                `${API_URL}/api/products`
            );


        const data =
            await response.json();


        const products =
            Array.isArray(data)
                ? data
                : (
                    data.products ||
                    []
                );


        const category =
            String(
                currentProduct.category ||
                ""
            )
            .trim()
            .toLowerCase();


        const related =
            products
                .filter(
                    product => {

                        if (
                            Number(
                                product.id
                            ) ===
                            Number(
                                currentProduct.id
                            )
                        ) {

                            return false;

                        }


                        return (
                            String(
                                product.category ||
                                ""
                            )
                            .trim()
                            .toLowerCase() ===
                            category
                        );

                    }
                )
                .slice(
                    0,
                    8
                );


        if (!related.length) {

            container.innerHTML = `
                <div class="related-loading">
                    No related products available.
                </div>
            `;

            return;

        }


        container.innerHTML =
            related
                .map(
                    product => `

                        <article
                            class="
                                related-product-card
                            "

                            onclick="
                                window.location.href=
                                'product-details.html?id=${Number(
                                    product.id
                                )}'
                            "
                        >

                            <div
                                class="
                                    related-product-image
                                "
                            >

                                <img
                                    src="${
                                        product.image_url ||
                                        "https://via.placeholder.com/400x400?text=No+Image"
                                    }"
                                    alt="${escapeAttribute(
                                        product.name
                                    )}"
                                >

                            </div>


                            <div
                                class="
                                    related-product-content
                                "
                            >

                                <p
                                    class="
                                        related-product-category
                                    "
                                >
                                    ${escapeHTML(
                                        product.category ||
                                        "Product"
                                    )}
                                </p>


                                <h3
                                    class="
                                        related-product-name
                                    "
                                >
                                    ${escapeHTML(
                                        product.name
                                    )}
                                </h3>


                                <div
                                    class="
                                        related-product-price
                                    "
                                >
                                    ₹${formatPrice(
                                        product.price
                                    )}
                                </div>

                            </div>

                        </article>

                    `
                )
                .join("");


    } catch (error) {

        console.error(
            "Related Products Error:",
            error
        );

    }

}


/* =========================
   COUNTS
========================= */

async function updateCartCount() {

    const element =
        document.getElementById(
            "cartCount"
        );


    if (
        !element ||
        !token
    ) {
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


        const data =
            await response.json();


        element.textContent =
            (
                data.cart_items ||
                []
            )
            .reduce(
                (
                    total,
                    item
                ) =>
                    total +
                    Number(
                        item.quantity ||
                        0
                    ),
                0
            );

    } catch (error) {

        console.error(
            "Cart Count Error:",
            error
        );

    }

}


async function updateWishlistCount() {

    const element =
        document.getElementById(
            "wishlistCount"
        );


    if (
        !element ||
        !token
    ) {
        return;
    }


    try {

        const response =
            await fetch(
                `${API_URL}/api/wishlist`,
                {
                    headers: {
                        "Authorization":
                            `Bearer ${token}`
                    }
                }
            );


        const data =
            await response.json();


        element.textContent =
            (
                data.wishlist ||
                []
            ).length;

    } catch (error) {

        console.error(
            "Wishlist Count Error:",
            error
        );

    }

}


/* =========================
   SEARCH
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
                input?.value.trim();


            if (!query) {
                return;
            }


            window.location.href =
                `shop.html?search=${encodeURIComponent(
                    query
                )}`;

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
   HELPERS
========================= */

function formatPrice(
    price
) {

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


function escapeHTML(
    value
) {

    const div =
        document.createElement(
            "div"
        );

    div.textContent =
        value ?? "";

    return div.innerHTML;

}


function escapeAttribute(
    value
) {

    return String(
        value ?? ""
    )
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        );

}


/* =========================
   START
========================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        loadProduct();

    }
);