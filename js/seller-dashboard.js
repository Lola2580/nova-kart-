const API_URL = "http://localhost:5000";

const token =
    localStorage.getItem("token");


/* =========================
   LOGIN CHECK
========================= */

if (!token) {

    window.location.href =
        "login.html";

}


/* =========================
   ELEMENTS
========================= */

const storeName =
    document.getElementById(
        "storeName"
    );

const storeStatus =
    document.getElementById(
        "storeStatus"
    );

const statusBadge =
    document.getElementById(
        "statusBadge"
    );

const totalProducts =
    document.getElementById(
        "totalProducts"
    );

const approvedProducts =
    document.getElementById(
        "approvedProducts"
    );

const pendingProducts =
    document.getElementById(
        "pendingProducts"
    );

const rejectedProducts =
    document.getElementById(
        "rejectedProducts"
    );

const sellerProducts =
    document.getElementById(
        "sellerProducts"
    );


/* =========================
   LOAD SELLER PROFILE
========================= */

async function loadSellerProfile() {

    try {

        const response =
            await fetch(
                `${API_URL}/api/seller/profile`,
                {
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
                "Unable to load seller profile"
            );

        }


        const seller =
            data.seller;


        storeName.textContent =
            seller.store_name ||
            "My Store";


        const status =
            String(
                seller.status ||
                "pending"
            )
            .toLowerCase();


        updateSellerStatus(
            status
        );


        /*
         * Product loading after
         * seller profile is confirmed.
         */

        await loadSellerProducts();

    } catch (error) {

        console.error(
            "Seller Profile Error:",
            error
        );


        storeName.textContent =
            "Seller account not found";


        storeStatus.textContent =
            error.message;


        statusBadge.textContent =
            "Error";

        statusBadge.className =
            "status-badge rejected";

    }

}


/* =========================
   SELLER STATUS
========================= */

function updateSellerStatus(
    status
) {

    statusBadge.className =
        "status-badge";


    if (
        status === "approved"
    ) {

        statusBadge.textContent =
            "Approved";


        statusBadge.classList.add(
            "approved"
        );


        storeStatus.textContent =
            "Your seller account is approved.";

        return;

    }


    if (
        status === "rejected"
    ) {

        statusBadge.textContent =
            "Rejected";


        statusBadge.classList.add(
            "rejected"
        );


        storeStatus.textContent =
            "Your seller application was rejected.";

        return;

    }


    /*
     * Default = pending
     */

    statusBadge.textContent =
        "Pending";


    statusBadge.classList.add(
        "pending"
    );


    storeStatus.textContent =
        "Your seller application is waiting for approval.";

}


/* =========================
   LOAD SELLER PRODUCTS
========================= */

async function loadSellerProducts() {

    try {

        sellerProducts.innerHTML = `
            <div class="loading">
                Loading products...
            </div>
        `;


        /*
         * We will create this API
         * next in server.js.
         */

        const response =
            await fetch(
                `${API_URL}/api/seller/products`,
                {
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
                "Unable to load products"
            );

        }


        const products =
            data.products ||
            [];


        updateProductStats(
            products
        );


        renderSellerProducts(
            products
        );


    } catch (error) {

        console.error(
            "Seller Products Error:",
            error
        );


        sellerProducts.innerHTML = `
            <div class="loading">
                ❌ ${escapeHTML(
                    error.message
                )}
            </div>
        `;

    }

}


/* =========================
   PRODUCT STATS
========================= */

function updateProductStats(
    products
) {

    const total =
        products.length;


    const approved =
        products.filter(
            product =>
                String(
                    product.status
                ).toLowerCase() ===
                "approved"
        ).length;


    const pending =
        products.filter(
            product =>
                String(
                    product.status
                ).toLowerCase() ===
                "pending"
        ).length;


    const rejected =
        products.filter(
            product =>
                String(
                    product.status
                ).toLowerCase() ===
                "rejected"
        ).length;


    totalProducts.textContent =
        total;


    approvedProducts.textContent =
        approved;


    pendingProducts.textContent =
        pending;


    rejectedProducts.textContent =
        rejected;

}


/* =========================
   RENDER PRODUCTS
========================= */

function renderSellerProducts(
    products
) {

    if (
        !products.length
    ) {

        sellerProducts.innerHTML = `

            <div class="loading">

                No products added yet.

                <br><br>

                Add your first product.

            </div>

        `;

        return;

    }


    sellerProducts.innerHTML =
        products
            .slice(
                0,
                8
            )
            .map(
                product => {

                    const status =
                        String(
                            product.status ||
                            "pending"
                        )
                        .toLowerCase();


                    return `

                        <article
                            class="
                                seller-product-card
                            "
                        >

                            <div
                                class="
                                    seller-product-image
                                "
                            >

                                <img
                                    src="${
                                        product.image_url ||
                                        "https://via.placeholder.com/300x300?text=No+Image"
                                    }"
                                    alt="${escapeAttribute(
                                        product.name ||
                                        "Product"
                                    )}"
                                    onerror="
                                        this.src='https://via.placeholder.com/300x300?text=No+Image'
                                    "
                                >

                            </div>


                            <div
                                class="
                                    seller-product-info
                                "
                            >

                                <h3>
                                    ${escapeHTML(
                                        product.name ||
                                        "Product"
                                    )}
                                </h3>


                                <p>
                                    ${escapeHTML(
                                        product.category ||
                                        "Product"
                                    )}
                                </p>


                                <strong>
                                    ₹${formatPrice(
                                        product.price
                                    )}
                                </strong>


                                <span
                                    class="
                                        product-status
                                        ${status}
                                    "
                                >
                                    ${capitalize(
                                        status
                                    )}
                                </span>

                            </div>

                        </article>

                    `;

                }
            )
            .join("");

}


/* =========================
   ADD PRODUCT
========================= */

const addProductBtn =
    document.getElementById(
        "addProductBtn"
    );


if (addProductBtn) {

    addProductBtn.addEventListener(
        "click",
        () => {

            /*
             * Seller approval will be
             * checked by backend too.
             */

            window.location.href =
                "product-index.html";

        }
    );

}


/* =========================
   MY PRODUCTS
========================= */

const myProductsBtn =
    document.getElementById(
        "myProductsBtn"
    );


if (myProductsBtn) {

    myProductsBtn.addEventListener(
        "click",
        () => {

            window.location.href =
                "seller-products.html";

        }
    );

}


/* =========================
   REFRESH
========================= */

const refreshProductsBtn =
    document.getElementById(
        "refreshProductsBtn"
    );


if (refreshProductsBtn) {

    refreshProductsBtn.addEventListener(
        "click",
        loadSellerProducts
    );

}


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
            minimumFractionDigits:
                2,

            maximumFractionDigits:
                2
        }
    );

}


function capitalize(
    value
) {

    if (!value) {
        return "";
    }


    return (
        value.charAt(0).toUpperCase() +
        value.slice(1)
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

        loadSellerProfile();

    }
);