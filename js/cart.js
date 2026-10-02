const API_URL = "http://localhost:5000";

let cartData = [];


/* =========================
   LOAD CART
========================= */

async function loadCart() {

    const token = localStorage.getItem("token");

    const cartItems =
        document.getElementById("cartItems");

    const emptyCart =
        document.getElementById("emptyCart");


    if (!token) {

        cartItems.innerHTML = `
            <div class="cart-loading">
                Please login to view your cart.
                <br><br>
                <a href="login.html" class="shop-btn">
                    Login
                </a>
            </div>
        `;

        updateSummary([]);

        return;
    }


    try {

        cartItems.innerHTML = `
            <div class="cart-loading">
                Loading cart...
            </div>
        `;


        const response = await fetch(
            `${API_URL}/api/cart`,
            {
                method: "GET",

                headers: {
                    "Authorization":
                        `Bearer ${token}`
                }
            }
        );


        const data = await response.json();


        if (!response.ok) {

            throw new Error(
                data.error ||
                "Unable to load cart"
            );
        }


        cartData =
            data.cart_items || [];


        renderCart(cartData);

        updateSummary(cartData);

        updateCartCount(cartData);


    } catch (error) {

        console.error(
            "Cart Error:",
            error
        );


        cartItems.innerHTML = `
            <div class="cart-loading">
                ❌ ${escapeHTML(error.message)}
            </div>
        `;

    }

}


/* =========================
   RENDER CART
========================= */

function renderCart(items) {

    const cartItems =
        document.getElementById("cartItems");

    const emptyCart =
        document.getElementById("emptyCart");


    if (items.length === 0) {

        cartItems.innerHTML = "";

        emptyCart.style.display =
            "block";

        return;
    }


    emptyCart.style.display =
        "none";


    cartItems.innerHTML = "";


    items.forEach(item => {

        const card =
            document.createElement("div");

        card.className =
            "cart-item";


        card.innerHTML = `

            <div class="cart-item-image">

                <img
                    src="${item.image_url || "https://via.placeholder.com/300x300?text=No+Image"}"
                    alt="${escapeHTML(item.name)}"
                    onerror="this.src='https://via.placeholder.com/300x300?text=No+Image'"
                >

            </div>


            <div class="cart-item-info">

                <h3>
                    ${escapeHTML(item.name)}
                </h3>

                <p>
                    Price:
                    ₹${formatPrice(item.price)}
                </p>

                <div class="cart-item-price">
                    ₹${formatPrice(item.price)}
                </div>


                <div class="quantity-box">

                    <button
                        onclick="changeQuantity(
                            ${item.cart_item_id},
                            ${item.quantity - 1}
                        )"
                    >
                        −
                    </button>


                    <span>
                        ${item.quantity}
                    </span>


                    <button
                        onclick="changeQuantity(
                            ${item.cart_item_id},
                            ${item.quantity + 1}
                        )"
                    >
                        +
                    </button>

                </div>

            </div>


            <div class="cart-item-actions">

                <div class="item-total">
                    ₹${formatPrice(item.total)}
                </div>


                <button
                    class="remove-btn"
                    onclick="removeCartItem(
                        ${item.cart_item_id}
                    )"
                >
                    Remove
                </button>

            </div>

        `;


        cartItems.appendChild(card);

    });

}


/* =========================
   UPDATE QUANTITY
========================= */

async function changeQuantity(
    cartItemId,
    newQuantity
) {

    if (newQuantity < 1) {

        removeCartItem(cartItemId);

        return;
    }


    const token =
        localStorage.getItem("token");


    if (!token) {

        window.location.href =
            "login.html";

        return;
    }


    try {

        /*
         * IMPORTANT:
         * Yahan PUT endpoint tumhare
         * backend ke actual endpoint
         * ke according hona chahiye.
         */

        const response = await fetch(
            `${API_URL}/api/cart/${cartItemId}`,
            {
                method: "PUT",

                headers: {

                    "Content-Type":
                        "application/json",

                    "Authorization":
                        `Bearer ${token}`
                },

                body: JSON.stringify({

                    quantity: newQuantity

                })
            }
        );


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data.error ||
                "Unable to update quantity"
            );
        }


        await loadCart();


    } catch (error) {

        console.error(
            "Quantity Error:",
            error
        );

        alert(
            "❌ " + error.message
        );

    }

}


/* =========================
   REMOVE CART ITEM
========================= */

async function removeCartItem(
    cartItemId
) {

    const token =
        localStorage.getItem("token");


    if (!token) {

        window.location.href =
            "login.html";

        return;
    }


    try {

        const response = await fetch(
            `${API_URL}/api/cart/${cartItemId}`,
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
                "Unable to remove item"
            );
        }


        await loadCart();


    } catch (error) {

        console.error(
            "Remove Cart Error:",
            error
        );

        alert(
            "❌ " + error.message
        );

    }

}


/* =========================
   SUMMARY
========================= */

function updateSummary(items) {

    const summaryItems =
        document.getElementById(
            "summaryItems"
        );

    const subtotal =
        document.getElementById(
            "subtotal"
        );

    const grandTotal =
        document.getElementById(
            "grandTotal"
        );


    let totalQuantity = 0;

    let totalPrice = 0;


    items.forEach(item => {

        totalQuantity +=
            Number(item.quantity);

        totalPrice +=
            Number(item.total);

    });


    summaryItems.textContent =
        totalQuantity;


    subtotal.textContent =
        `₹${formatPrice(totalPrice)}`;


    grandTotal.textContent =
        `₹${formatPrice(totalPrice)}`;

}


/* =========================
   CART COUNT
========================= */

function updateCartCount(items) {

    const cartCount =
        document.getElementById(
            "cartCount"
        );


    if (!cartCount) {
        return;
    }


    const count =
        items.reduce(
            (total, item) =>
                total +
                Number(item.quantity),
            0
        );


    cartCount.textContent =
        count;

}


/* =========================
   CHECKOUT
========================= */

const checkoutButton =
    document.getElementById(
        "checkoutBtn"
    );


if (checkoutButton) {

    checkoutButton.addEventListener(
        "click",
        () => {

            if (cartData.length === 0) {

                alert(
                    "Your cart is empty."
                );

                return;
            }


            window.location.href =
                "checkout.html";

        }
    );

}


/* =========================
   FORMAT PRICE
========================= */

function formatPrice(price) {

    return Number(price || 0)
        .toLocaleString(
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
        document.createElement("div");

    div.textContent =
        value ?? "";

    return div.innerHTML;

}


/* =========================
   START
========================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        loadCart();

    }
);