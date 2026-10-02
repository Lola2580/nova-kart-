const API_URL = "http://localhost:5000";

const token = localStorage.getItem("token");

if (!token) {
    window.location.href = "login.html";
}


/* =========================
   GLOBAL DATA
========================= */

let allOrders = [];
let activeFilter = "all";


/* =========================
   LOAD ORDERS
========================= */

async function loadOrders() {

    const container =
        document.getElementById("ordersContainer");

    const emptyOrders =
        document.getElementById("emptyOrders");

    try {

        const response = await fetch(
            `${API_URL}/api/orders`,
            {
                method: "GET",

                headers: {
                    "Authorization": `Bearer ${token}`
                }
            }
        );

        if (response.status === 401) {

            localStorage.removeItem("token");

            window.location.href =
                "login.html";

            return;
        }

        const data = await response.json();

        if (!response.ok) {

            throw new Error(
                data.error || "Failed to load orders"
            );
        }


        /*
         * API can return:
         * { orders: [...] }
         * OR
         * [...]
         */

        allOrders =
            Array.isArray(data)
                ? data
                : (data.orders || []);


        if (allOrders.length === 0) {

            container.innerHTML = "";

            emptyOrders.style.display =
                "flex";

            return;
        }


        emptyOrders.style.display =
            "none";

        renderOrders();


    } catch (error) {

        console.error(
            "Orders Error:",
            error
        );

        container.innerHTML = `
            <div class="empty-orders">

                <div class="empty-icon">
                    ⚠️
                </div>

                <h2>
                    Unable to Load Orders
                </h2>

                <p>
                    ${escapeHTML(error.message)}
                </p>

                <button
                    class="shop-now-btn"
                    onclick="loadOrders()"
                >
                    Try Again
                </button>

            </div>
        `;

    }

}


/* =========================
   RENDER ORDERS
========================= */

function renderOrders() {

    const container =
        document.getElementById(
            "ordersContainer"
        );


    let orders = allOrders;


    if (activeFilter !== "all") {

        orders = allOrders.filter(order => {

            const status =
                String(
                    order.status || ""
                ).toLowerCase();

            return status === activeFilter;

        });

    }


    if (orders.length === 0) {

        container.innerHTML = `
            <div class="empty-orders">

                <div class="empty-icon">
                    📦
                </div>

                <h2>
                    No ${capitalize(activeFilter)} Orders
                </h2>

                <p>
                    No orders found with this status.
                </p>

            </div>
        `;

        return;
    }


    container.innerHTML =
        orders.map(
            order => createOrderCard(order)
        ).join("");

}


/* =========================
   ORDER CARD
========================= */

function createOrderCard(order) {

    const orderId =
        order.id ||
        order.order_id ||
        "—";


    const status =
        String(
            order.status || "pending"
        ).toLowerCase();


    const total =
        Number(
            order.total ||
            order.total_amount ||
            order.amount ||
            0
        );


    const date =
        formatDate(
            order.created_at ||
            order.order_date ||
            order.date
        );


    /*
     * Some APIs may return:
     * items
     * order_items
     */

    const items =
        order.items ||
        order.order_items ||
        [];


    let productHTML = "";


    if (items.length > 0) {

        const previewItems =
            items.slice(0, 3);


        productHTML =
            previewItems.map(item => {

                const image =
                    item.image_url ||
                    item.image ||
                    item.product_image ||
                    "";


                return `
                    <div class="order-product-image">

                        ${
                            image
                            ? `<img
                                src="${escapeAttribute(image)}"
                                alt="Product"
                              >`
                            : `📦`
                        }

                    </div>
                `;

            }).join("");


        if (items.length > 3) {

            productHTML += `
                <div class="order-product-more">
                    +${items.length - 3}
                </div>
            `;

        }

    } else {

        productHTML = `
            <div class="order-product-image">
                📦
            </div>
        `;

    }


    const itemCount =
        items.reduce(
            (total, item) =>
                total +
                Number(item.quantity || 1),
            0
        );


    return `
        <article class="order-card">

            <div class="order-top">

                <div class="order-number">

                    <span>
                        Order ID
                    </span>

                    <strong>
                        #${escapeHTML(String(orderId))}
                    </strong>

                </div>


                <span
                    class="order-status status-${escapeAttribute(status)}"
                >
                    ${capitalize(status)}
                </span>

            </div>


            <div class="order-body">

                <div class="order-products">

                    ${productHTML}

                </div>


                <div class="order-info">

                    <span class="order-info-label">
                        Items
                    </span>

                    <span class="order-info-value">
                        ${itemCount}
                    </span>

                </div>


                <div class="order-total">

                    <span>
                        Total
                    </span>

                    <strong>
                        ₹${total.toFixed(2)}
                    </strong>

                </div>

            </div>


            <div class="order-footer">

                <span class="order-date">
                    Ordered on ${date}
                </span>


                <button
                    class="view-order-btn"
                    onclick="openOrderDetails(${Number(orderId)})"
                >
                    View Details →
                </button>

            </div>

        </article>
    `;

}


/* =========================
   FILTER
========================= */

document
    .querySelectorAll(".filter-btn")
    .forEach(button => {

        button.addEventListener(
            "click",
            () => {

                document
                    .querySelectorAll(
                        ".filter-btn"
                    )
                    .forEach(btn => {

                        btn.classList.remove(
                            "active"
                        );

                    });


                button.classList.add(
                    "active"
                );


                activeFilter =
                    button.dataset.status;


                renderOrders();

            }
        );

    });


/* =========================
   ORDER DETAILS
========================= */

function openOrderDetails(orderId) {

    const order =
        allOrders.find(
            item =>
                Number(
                    item.id ||
                    item.order_id
                ) === Number(orderId)
        );


    if (!order) {

        alert(
            "Order details not found."
        );

        return;
    }


    const modal =
        document.getElementById(
            "orderModal"
        );


    const items =
        order.items ||
        order.order_items ||
        [];


    document.getElementById(
        "modalOrderId"
    ).textContent =
        `Order #${orderId}`;


    document.getElementById(
        "modalOrderDate"
    ).textContent =
        formatDate(
            order.created_at ||
            order.order_date ||
            order.date
        );


    const status =
        String(
            order.status || "pending"
        ).toLowerCase();


    document.getElementById(
        "modalOrderStatus"
    ).textContent =
        capitalize(status);


    /* =====================
       ITEMS
    ===================== */

    const itemsContainer =
        document.getElementById(
            "modalOrderItems"
        );


    if (items.length === 0) {

        itemsContainer.innerHTML = `
            <p>
                No product information available.
            </p>
        `;

    } else {

        itemsContainer.innerHTML =
            items.map(item => {

                const image =
                    item.image_url ||
                    item.image ||
                    item.product_image ||
                    "";


                const name =
                    item.product_name ||
                    item.name ||
                    "Product";


                const quantity =
                    Number(
                        item.quantity || 1
                    );


                const price =
                    Number(
                        item.price ||
                        item.unit_price ||
                        0
                    );


                return `
                    <div class="modal-order-item">

                        <div class="modal-item-image">

                            ${
                                image
                                ? `<img
                                    src="${escapeAttribute(image)}"
                                    alt="Product"
                                  >`
                                : `📦`
                            }

                        </div>


                        <div class="modal-item-info">

                            <strong>
                                ${escapeHTML(name)}
                            </strong>

                            <span>
                                Qty: ${quantity}
                            </span>

                        </div>


                        <div class="modal-item-total">

                            ₹${(
                                price * quantity
                            ).toFixed(2)}

                        </div>

                    </div>
                `;

            }).join("");

    }


    /* =====================
       ADDRESS
    ===================== */

    const address =
        order.address ||
        order.delivery_address ||
        order.shipping_address ||
        "Address not available";


    document.getElementById(
        "modalAddress"
    ).textContent =
        typeof address === "object"
            ? formatAddress(address)
            : address;


    /* =====================
       PAYMENT
    ===================== */

    document.getElementById(
        "modalPayment"
    ).textContent =
        order.payment_method ||
        order.payment ||
        "Not available";


    /* =====================
       TOTAL
    ===================== */

    const total =
        Number(
            order.total ||
            order.total_amount ||
            order.amount ||
            0
        );


    document.getElementById(
        "modalTotal"
    ).textContent =
        `₹${total.toFixed(2)}`;


    modal.classList.add(
        "show"
    );

}


/* =========================
   CLOSE MODAL
========================= */

document
    .getElementById("closeOrderModal")
    .addEventListener(
        "click",
        () => {

            document
                .getElementById(
                    "orderModal"
                )
                .classList.remove(
                    "show"
                );

        }
    );


document
    .getElementById("orderModal")
    .addEventListener(
        "click",
        event => {

            if (
                event.target.id ===
                "orderModal"
            ) {

                event.target.classList.remove(
                    "show"
                );

            }

        }
    );


/* =========================
   CART COUNT
========================= */

async function loadCartCount() {

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
            data.cart_items ||
            data.items ||
            data.cart ||
            [];


        const count =
            items.reduce(
                (total, item) =>
                    total +
                    Number(item.quantity || 0),
                0
            );


        const cartCount =
            document.getElementById(
                "cartCount"
            );


        if (cartCount) {

            cartCount.textContent =
                count;

        }

    } catch (error) {

        console.error(
            "Cart count error:",
            error
        );

    }

}


/* =========================
   SEARCH
========================= */

const searchBtn =
    document.getElementById(
        "searchBtn"
    );

const searchInput =
    document.getElementById(
        "searchInput"
    );


if (searchBtn && searchInput) {

    searchBtn.addEventListener(
        "click",
        searchProducts
    );


    searchInput.addEventListener(
        "keydown",
        event => {

            if (
                event.key === "Enter"
            ) {

                searchProducts();

            }

        }
    );

}


function searchProducts() {

    const query =
        searchInput.value.trim();


    if (!query) {
        return;
    }


    window.location.href =
        `shop.html?search=${encodeURIComponent(query)}`;

}


/* =========================
   HELPERS
========================= */

function capitalize(value) {

    if (!value) {
        return "";
    }

    return value
        .charAt(0)
        .toUpperCase() +
        value.slice(1);

}


function formatDate(dateValue) {

    if (!dateValue) {
        return "Date unavailable";
    }


    const date =
        new Date(dateValue);


    if (isNaN(date.getTime())) {
        return String(dateValue);
    }


    return date.toLocaleDateString(
        "en-IN",
        {
            day: "2-digit",
            month: "short",
            year: "numeric"
        }
    );

}


function formatAddress(address) {

    if (!address) {
        return "Address not available";
    }


    return [
        address.name,
        address.address,
        address.city,
        address.state,
        address.pincode,
        address.phone
    ]
        .filter(Boolean)
        .join(", ");

}


function escapeHTML(value) {

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}


function escapeAttribute(value) {

    return escapeHTML(value);

}


/* =========================
   START
========================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        loadOrders();

        loadCartCount();

    }
);