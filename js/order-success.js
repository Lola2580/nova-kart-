const API_URL = "http://localhost:5000";


/* =========================
   TOKEN
========================= */

const token = localStorage.getItem("token");


if (!token) {

    window.location.href =
        "login.html";

}


/* =========================
   GET ORDER ID
========================= */

function getOrderId() {

    const params =
        new URLSearchParams(
            window.location.search
        );

    return (
        params.get("order_id") ||
        params.get("order") ||
        localStorage.getItem(
            "lastOrderId"
        )
    );
}


/* =========================
   LOAD ORDER DETAILS
========================= */

async function loadOrderDetails() {

    const orderId =
        getOrderId();


    if (!orderId) {

        showError(
            "Order ID not found."
        );

        return;
    }


    try {

        const response =
            await fetch(
                `${API_URL}/api/orders/${encodeURIComponent(orderId)}`,
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

            localStorage.removeItem(
                "token"
            );

            window.location.href =
                "login.html";

            return;
        }


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data.error ||
                "Unable to load order details"
            );
        }


        const order =
            data.order || data;


        renderOrder(order);


    } catch (error) {

        console.error(
            "Order Success Error:",
            error
        );


        showError(
            error.message
        );

    }

}


/* =========================
   RENDER ORDER
========================= */

function renderOrder(order) {

    /* =====================
       BASIC ORDER INFO
    ===================== */

    setText(
        "orderId",
        `#${order.id || "—"}`
    );


    setText(
        "orderDate",
        formatDate(
            order.created_at
        )
    );


    const status =
        String(
            order.status ||
            "pending"
        ).toLowerCase();


    setText(
        "orderStatus",
        capitalize(status)
    );


    setText(
        "trackingStatus",
        capitalize(status)
    );


    updateTrackingMessage(
        status
    );


    /* =====================
       DELIVERY
    ===================== */

    setText(
        "deliveryName",
        order.full_name ||
        order.name ||
        "—"
    );


    setText(
        "deliveryPhone",
        order.phone ||
        "—"
    );


    setText(
        "deliveryAddress",
        order.address ||
        "—"
    );


    setText(
        "deliveryCity",
        order.city ||
        "—"
    );


    setText(
        "deliveryState",
        order.state ||
        "—"
    );


    setText(
        "deliveryPincode",
        order.pincode ||
        "—"
    );


    setText(
        "deliveryCountry",
        order.country ||
        "India"
    );


    /* =====================
       PAYMENT
    ===================== */

    setText(
        "paymentMethod",
        formatPaymentMethod(
            order.payment_method
        )
    );


    setText(
        "paymentStatus",
        formatPaymentStatus(
            order.payment_status
        )
    );


    setText(
        "paymentDetails",
        order.payment_details ||
        getDefaultPaymentDetails(
            order.payment_method
        )
    );


    /* =====================
       PRODUCTS
    ===================== */

    const items =
        order.items ||
        order.order_items ||
        [];


    renderProducts(
        items
    );


    /* =====================
       PRICE SUMMARY
    ===================== */

    calculateSummary(
        order,
        items
    );


    /* =====================
       BUTTONS
    ===================== */

    setupButtons();

}


/* =========================
   RENDER PRODUCTS
========================= */

function renderProducts(items) {

    const container =
        document.getElementById(
            "orderProducts"
        );


    if (!container) {
        return;
    }


    if (
        !Array.isArray(items) ||
        items.length === 0
    ) {

        container.innerHTML = `
            <div class="success-error">
                Product details are not available.
            </div>
        `;

        return;
    }


    container.innerHTML =
        items.map(item => {

            const name =
                item.product_name ||
                item.name ||
                "Product";


            const description =
                item.description ||
                "Product description unavailable.";


            const image =
                item.image_url ||
                item.image ||
                "https://via.placeholder.com/300x300?text=No+Image";


            const quantity =
                Number(
                    item.quantity || 1
                );


            const originalPrice =
                Number(
                    item.original_price ??
                    item.mrp ??
                    item.price ??
                    0
                );


            const discount =
                Number(
                    item.discount_amount ??
                    item.discount ??
                    0
                );


            const finalPrice =
                Number(
                    item.final_price ??
                    item.price ??
                    0
                );


            const total =
                finalPrice *
                quantity;


            return `

                <div class="order-product">

                    <div class="order-product-image">

                        <img
                            src="${escapeAttribute(image)}"
                            alt="${escapeAttribute(name)}"
                            onerror="this.src='https://via.placeholder.com/300x300?text=No+Image'"
                        >

                    </div>


                    <div class="order-product-info">

                        <h3>
                            ${escapeHTML(name)}
                        </h3>


                        <p class="product-description">
                            ${escapeHTML(description)}
                        </p>


                        <div class="product-meta">

                            <span>
                                Qty:
                                <strong>
                                    ${quantity}
                                </strong>
                            </span>

                            <span>
                                Price:
                                <strong>
                                    ₹${formatPrice(finalPrice)}
                                </strong>
                            </span>

                        </div>

                    </div>


                    <div class="order-product-price">

                        ${
                            originalPrice > finalPrice
                            ? `
                                <span class="original">
                                    ₹${formatPrice(originalPrice)}
                                </span>
                            `
                            : ""
                        }


                        ${
                            discount > 0
                            ? `
                                <span class="discount">
                                    Save ₹${formatPrice(discount)}
                                </span>
                            `
                            : ""
                        }


                        <span class="final">
                            ₹${formatPrice(total)}
                        </span>

                    </div>

                </div>

            `;

        }).join("");

}


/* =========================
   PRICE SUMMARY
========================= */

function calculateSummary(
    order,
    items
) {

    let originalPrice = 0;

    let discountAmount = 0;


    items.forEach(item => {

        const quantity =
            Number(
                item.quantity || 1
            );


        const original =
            Number(
                item.original_price ??
                item.mrp ??
                item.price ??
                0
            );


        const finalPrice =
            Number(
                item.final_price ??
                item.price ??
                0
            );


        originalPrice +=
            original * quantity;


        discountAmount +=
            Math.max(
                0,
                (original - finalPrice) *
                quantity
            );

    });


    const subtotal =
        Number(
            order.subtotal ??
            order.sub_total ??
            (
                originalPrice -
                discountAmount
            )
        );


    const tax =
        Number(
            order.tax_amount ??
            order.gst_amount ??
            order.tax ??
            0
        );


    const delivery =
        Number(
            order.delivery_charge ??
            order.shipping_charge ??
            0
        );


    const finalTotal =
        Number(
            order.total_amount ??
            order.final_amount ??
            subtotal +
            tax +
            delivery
        );


    setText(
        "originalPrice",
        `₹${formatPrice(
            originalPrice
        )}`
    );


    setText(
        "discountAmount",
        `-₹${formatPrice(
            discountAmount
        )}`
    );


    setText(
        "taxAmount",
        `₹${formatPrice(
            tax
        )}`
    );


    setText(
        "deliveryCharge",
        delivery > 0
            ? `₹${formatPrice(delivery)}`
            : "FREE"
    );


    setText(
        "finalTotal",
        `₹${formatPrice(
            finalTotal
        )}`
    );

}


/* =========================
   TRACKING MESSAGE
========================= */

function updateTrackingMessage(
    status
) {

    const messages = {

        pending:
            "Your order has been received and is waiting for confirmation.",

        confirmed:
            "Your order has been confirmed and will be processed soon.",

        processing:
            "Your order is currently being prepared.",

        shipped:
            "Your order has been shipped.",

        "out-for-delivery":
            "Your order is out for delivery.",

        delivered:
            "Your order has been delivered successfully.",

        cancelled:
            "This order has been cancelled."

    };


    setText(
        "trackingMessage",

        messages[status] ||
        "Your order is being processed."
    );

}


/* =========================
   BUTTONS
========================= */

function setupButtons() {

    const viewOrdersBtn =
        document.getElementById(
            "viewOrdersBtn"
        );


    const continueShoppingBtn =
        document.getElementById(
            "continueShoppingBtn"
        );


    if (viewOrdersBtn) {

        viewOrdersBtn.onclick =
            () => {

                window.location.href =
                    "orders.html";

            };

    }


    if (
        continueShoppingBtn
    ) {

        continueShoppingBtn.onclick =
            () => {

                window.location.href =
                    "shop.html";

            };

    }

}


/* =========================
   PAYMENT HELPERS
========================= */

function formatPaymentMethod(
    method
) {

    if (!method) {
        return "—";
    }


    const value =
        String(method)
            .toLowerCase();


    const methods = {

        cod:
            "Cash on Delivery",

        online:
            "Online Payment",

        upi:
            "UPI",

        card:
            "Card",

        netbanking:
            "Net Banking"

    };


    return (
        methods[value] ||
        capitalize(
            String(method)
        )
    );

}


function formatPaymentStatus(
    status
) {

    if (!status) {

        return "Pending";

    }


    return capitalize(
        String(status)
    );

}


function getDefaultPaymentDetails(
    method
) {

    const value =
        String(
            method || ""
        ).toLowerCase();


    if (value === "cod") {

        return "Pay on delivery";

    }


    if (value === "upi") {

        return "UPI payment";

    }


    if (value === "card") {

        return "Card payment";

    }


    return "—";

}


/* =========================
   ERROR
========================= */

function showError(
    message
) {

    const productContainer =
        document.getElementById(
            "orderProducts"
        );


    if (productContainer) {

        productContainer.innerHTML = `
            <div class="success-error">
                ❌ ${escapeHTML(message)}
            </div>
        `;

    }

}


/* =========================
   HELPERS
========================= */

function setText(
    id,
    value
) {

    const element =
        document.getElementById(id);


    if (element) {

        element.textContent =
            value ?? "—";

    }

}


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


function formatDate(
    dateValue
) {

    if (!dateValue) {
        return "—";
    }


    const date =
        new Date(dateValue);


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

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


function capitalize(
    value
) {

    if (!value) {
        return "";

    }


    return (
        value.charAt(0)
        .toUpperCase() +
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

        loadOrderDetails();

    }
);