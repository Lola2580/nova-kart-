const API_URL = "http://localhost:5000";

let checkoutCart = [];
let savedAddresses = [];
let selectedAddress = null;


/* =========================
   CHECK LOGIN
========================= */

const token =
    localStorage.getItem("token");


if (!token) {

    window.location.href =
        "login.html";

}


/* =========================
   LOAD CHECKOUT CART
========================= */

async function loadCheckoutCart() {

    const itemsContainer =
        document.getElementById(
            "checkoutItems"
        );


    if (!itemsContainer) {
        return;
    }


    try {

        itemsContainer.innerHTML = `
            <div class="cart-loading">
                Loading your order...
            </div>
        `;


        const response =
            await fetch(
                `${API_URL}/api/cart`,
                {
                    method: "GET",

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
                "Unable to load cart"
            );

        }


        checkoutCart =
            data.cart_items || [];


        if (
            checkoutCart.length === 0
        ) {

            itemsContainer.innerHTML = `
                <div class="cart-loading">

                    Your cart is empty.

                    <br><br>

                    <a
                        href="shop.html"
                        class="shop-btn"
                    >
                        Continue Shopping
                    </a>

                </div>
            `;


            updateSummary([]);


            const button =
                document.getElementById(
                    "placeOrderBtn"
                );


            if (button) {
                button.disabled = true;
            }


            return;
        }


        renderCheckoutItems(
            checkoutCart
        );


        updateSummary(
            checkoutCart
        );


        /*
         * IMPORTANT:
         * Load saved addresses
         * after cart is loaded.
         */

        await loadSavedAddresses();


    } catch (error) {

        console.error(
            "Checkout Cart Error:",
            error
        );


        itemsContainer.innerHTML = `
            <div class="cart-loading">

                ❌
                ${escapeHTML(
                    error.message
                )}

            </div>
        `;

    }

}


/* =========================
   LOAD SAVED ADDRESSES
========================= */

async function loadSavedAddresses() {

    const container =
        document.getElementById(
            "savedAddressContainer"
        );


    if (!container) {

        console.error(
            "savedAddressContainer not found"
        );

        return;
    }


    container.innerHTML = `
        <div class="cart-loading">
            Loading address...
        </div>
    `;


    try {

        console.log(
            "Loading saved addresses..."
        );


        const response =
            await fetch(
                `${API_URL}/api/addresses`,
                {
                    method: "GET",

                    headers: {
                        "Authorization":
                            `Bearer ${token}`
                    }
                }
            );


        const data =
            await response.json();


        console.log(
            "Address API Response:",
            data
        );


        if (!response.ok) {

            throw new Error(
                data.error ||
                "Unable to load addresses"
            );

        }


        savedAddresses =
            Array.isArray(
                data.addresses
            )
                ? data.addresses
                : [];


        console.log(
            "Saved Addresses:",
            savedAddresses
        );


        /*
         * Find DEFAULT address first.
         */

        selectedAddress =
            savedAddresses.find(
                address =>
                    address.is_default === true ||
                    address.is_default === "true"
            ) || null;


        /*
         * If no default exists,
         * select first address.
         */

        if (
            !selectedAddress &&
            savedAddresses.length > 0
        ) {

            selectedAddress =
                savedAddresses[0];

        }


        console.log(
            "Selected Address:",
            selectedAddress
        );


        renderSelectedAddress();

        renderAddressList();


    } catch (error) {

        console.error(
            "Address Load Error:",
            error
        );


        container.innerHTML = `
            <div class="address-error">

                ❌
                ${escapeHTML(
                    error.message
                )}

            </div>
        `;

    }

}


/* =========================
   RENDER SELECTED ADDRESS
========================= */

function renderSelectedAddress() {

    const container =
        document.getElementById(
            "savedAddressContainer"
        );


    const changeButton =
        document.getElementById(
            "changeAddressBtn"
        );


    const addButton =
        document.getElementById(
            "addAddressBtn"
        );


    if (!container) {
        return;
    }


    /*
     * NO ADDRESS
     */

    if (!selectedAddress) {

        container.innerHTML = `
            <div class="saved-address-card">

                <div class="saved-address-header">

                    <div class="saved-address-title">
                        No Saved Address
                    </div>

                </div>

                <div class="saved-address-text">
                    No delivery address is saved
                    for your account.
                </div>

            </div>
        `;


        if (changeButton) {

            changeButton.style.display =
                "none";

        }


        if (addButton) {

            addButton.style.display =
                "inline-flex";

        }


        return;
    }


    /*
     * ADDRESS EXISTS
     */

    const type =
        String(
            selectedAddress.address_type ||
            "home"
        ).toLowerCase();


    const addressIcon =
        getAddressIcon(type);


    const addressType =
        capitalize(type);


    container.innerHTML = `

        <div class="saved-address-card">

            <div class="saved-address-header">

                <div class="saved-address-title">

                    ${addressIcon}

                    ${escapeHTML(
                        addressType
                    )}

                </div>


                ${
                    isAddressDefault(
                        selectedAddress
                    )
                    ? `
                        <span
                            class="saved-address-badge"
                        >
                            Default
                        </span>
                    `
                    : ""
                }

            </div>


            <div class="saved-address-name">

                ${escapeHTML(
                    selectedAddress.full_name ||
                    "—"
                )}

            </div>


            <div class="saved-address-phone">

                📞
                ${escapeHTML(
                    selectedAddress.phone ||
                    "—"
                )}

            </div>


            <div class="saved-address-text">

                ${escapeHTML(
                    selectedAddress.address_line ||
                    "—"
                )}

                <br>

                ${escapeHTML(
                    selectedAddress.city ||
                    "—"
                )},

                ${escapeHTML(
                    selectedAddress.state ||
                    "—"
                )}

                -

                ${escapeHTML(
                    selectedAddress.pincode ||
                    "—"
                )}

                <br>

                ${escapeHTML(
                    selectedAddress.country ||
                    "India"
                )}

            </div>

        </div>

    `;


    /*
     * Show Change Address only
     * when multiple addresses exist.
     */

    if (changeButton) {

        changeButton.style.display =
            savedAddresses.length > 1
                ? "inline-flex"
                : "none";

    }


    if (addButton) {

        addButton.style.display =
            "inline-flex";

    }

}


/* =========================
   RENDER ADDRESS LIST
========================= */

function renderAddressList() {

    const list =
        document.getElementById(
            "addressList"
        );


    if (!list) {
        return;
    }


    if (
        savedAddresses.length === 0
    ) {

        list.innerHTML = `
            <div class="cart-loading">
                No saved addresses found.
            </div>
        `;

        return;
    }


    list.innerHTML =
        savedAddresses
            .map(
                address => {

                    const selected =
                        selectedAddress &&
                        Number(
                            selectedAddress.id
                        ) ===
                        Number(
                            address.id
                        );


                    const type =
                        String(
                            address.address_type ||
                            "home"
                        ).toLowerCase();


                    return `

                        <div
                            class="
                                checkout-address-item
                                ${
                                    selected
                                        ? "active"
                                        : ""
                                }
                            "
                            data-address-id="${Number(
                                address.id
                            )}"
                        >

                            <div
                                class="saved-address-header"
                            >

                                <div
                                    class="saved-address-title"
                                >

                                    ${getAddressIcon(
                                        type
                                    )}

                                    ${escapeHTML(
                                        capitalize(
                                            type
                                        )
                                    )}

                                </div>


                                ${
                                    isAddressDefault(
                                        address
                                    )
                                    ? `
                                        <span
                                            class="
                                                saved-address-badge
                                            "
                                        >
                                            Default
                                        </span>
                                    `
                                    : ""
                                }

                            </div>


                            <div
                                class="
                                    saved-address-name
                                "
                            >
                                ${escapeHTML(
                                    address.full_name ||
                                    "—"
                                )}
                            </div>


                            <div
                                class="
                                    saved-address-phone
                                "
                            >
                                📞
                                ${escapeHTML(
                                    address.phone ||
                                    "—"
                                )}
                            </div>


                            <div
                                class="
                                    saved-address-text
                                "
                            >

                                ${escapeHTML(
                                    address.address_line ||
                                    "—"
                                )}

                                <br>

                                ${escapeHTML(
                                    address.city ||
                                    "—"
                                )},

                                ${escapeHTML(
                                    address.state ||
                                    "—"
                                )}

                                -

                                ${escapeHTML(
                                    address.pincode ||
                                    "—"
                                )}

                            </div>

                        </div>

                    `;

                }
            )
            .join("");


    /*
     * Address click
     */

    list
        .querySelectorAll(
            ".checkout-address-item"
        )
        .forEach(item => {

            item.addEventListener(
                "click",
                () => {

                    const id =
                        Number(
                            item.dataset.addressId
                        );


                    const address =
                        savedAddresses.find(
                            saved =>
                                Number(
                                    saved.id
                                ) === id
                        );


                    if (!address) {

                        return;

                    }


                    selectedAddress =
                        address;


                    renderSelectedAddress();

                    renderAddressList();

                    closeAddressSelector();

                }
            );

        });

}


/* =========================
   OPEN ADDRESS SELECTOR
========================= */

function openAddressSelector() {

    const selector =
        document.getElementById(
            "addressSelector"
        );


    if (!selector) {
        return;
    }


    renderAddressList();


    selector.style.display =
        "block";


    selector.scrollIntoView({
        behavior: "smooth",
        block: "nearest"
    });

}


/* =========================
   CLOSE ADDRESS SELECTOR
========================= */

function closeAddressSelector() {

    const selector =
        document.getElementById(
            "addressSelector"
        );


    if (selector) {

        selector.style.display =
            "none";

    }

}


/* =========================
   OPEN ADD ADDRESS
========================= */

function openNewAddressForm() {

    const form =
        document.getElementById(
            "checkoutNewAddress"
        );


    if (!form) {
        return;
    }


    resetNewAddressForm();


    form.style.display =
        "block";


    form.scrollIntoView({
        behavior: "smooth",
        block: "nearest"
    });

}


/* =========================
   CLOSE ADD ADDRESS
========================= */

function closeNewAddressForm() {

    const form =
        document.getElementById(
            "checkoutNewAddress"
        );


    if (form) {

        form.style.display =
            "none";

    }

}


/* =========================
   RESET NEW ADDRESS FORM
========================= */

function resetNewAddressForm() {

    setValue(
        "fullName",
        ""
    );


    setValue(
        "phone",
        ""
    );


    setValue(
        "address",
        ""
    );


    setValue(
        "city",
        ""
    );


    setValue(
        "state",
        ""
    );


    setValue(
        "pincode",
        ""
    );


    setValue(
        "country",
        "India"
    );

}


/* =========================
   SAVE NEW CHECKOUT ADDRESS
========================= */

async function saveCheckoutAddress() {

    const fullName =
        getValue(
            "fullName"
        );


    const phone =
        getValue(
            "phone"
        );


    const address =
        getValue(
            "address"
        );


    const city =
        getValue(
            "city"
        );


    const state =
        getValue(
            "state"
        );


    const pincode =
        getValue(
            "pincode"
        );


    const country =
        getValue(
            "country"
        );


    if (
        !fullName ||
        !phone ||
        !address ||
        !city ||
        !state ||
        !pincode
    ) {

        alert(
            "Please fill all delivery information."
        );

        return;
    }


    if (
        !/^[0-9]{10}$/.test(
            phone
        )
    ) {

        alert(
            "Please enter a valid 10-digit phone number."
        );

        return;
    }


    if (
        !/^[0-9]{6}$/.test(
            pincode
        )
    ) {

        alert(
            "Please enter a valid 6-digit pincode."
        );

        return;
    }


    const saveButton =
        document.getElementById(
            "saveCheckoutAddress"
        );


    if (saveButton) {

        saveButton.disabled =
            true;

        saveButton.textContent =
            "Saving...";

    }


    try {

        /*
         * New checkout address
         * will become default.
         */

        const response =
            await fetch(
                `${API_URL}/api/addresses`,
                {
                    method: "POST",

                    headers: {

                        "Content-Type":
                            "application/json",

                        "Authorization":
                            `Bearer ${token}`

                    },

                    body:
                        JSON.stringify({

                            address_type:
                                "home",

                            full_name:
                                fullName,

                            phone:
                                phone,

                            address_line:
                                address,

                            city:
                                city,

                            state:
                                state,

                            pincode:
                                pincode,

                            country:
                                country ||
                                "India",

                            is_default:
                                true

                        })

                }
            );


        const data =
            await response.json();


        console.log(
            "New Address Response:",
            data
        );


        if (!response.ok) {

            throw new Error(
                data.error ||
                "Unable to save address"
            );

        }


        /*
         * Reload addresses from database.
         */

        await loadSavedAddresses();


        /*
         * Select newly created address.
         */

        if (
            data.address &&
            data.address.id
        ) {

            const newAddress =
                savedAddresses.find(
                    address =>
                        Number(
                            address.id
                        ) ===
                        Number(
                            data.address.id
                        )
                );


            if (newAddress) {

                selectedAddress =
                    newAddress;

            }

        }


        renderSelectedAddress();


        closeNewAddressForm();


        alert(
            "✅ Address saved successfully!"
        );


    } catch (error) {

        console.error(
            "Save Address Error:",
            error
        );


        alert(
            "❌ " +
            error.message
        );

    } finally {

        if (saveButton) {

            saveButton.disabled =
                false;

            saveButton.textContent =
                "Save Address";

        }

    }

}


/* =========================
   RENDER CHECKOUT ITEMS
========================= */

function renderCheckoutItems(
    items
) {

    const container =
        document.getElementById(
            "checkoutItems"
        );


    if (!container) {
        return;
    }


    container.innerHTML = "";


    items.forEach(item => {

        const div =
            document.createElement(
                "div"
            );


        div.className =
            "checkout-item";


        div.innerHTML = `

            <div
                class="checkout-item-image"
            >

                <img
                    src="${
                        item.image_url ||
                        "https://via.placeholder.com/100x100?text=No+Image"
                    }"

                    alt="${escapeHTML(
                        item.name
                    )}"

                    onerror="
                        this.src='https://via.placeholder.com/100x100?text=No+Image'
                    "
                >

            </div>


            <div
                class="checkout-item-info"
            >

                <h3>
                    ${escapeHTML(
                        item.name
                    )}
                </h3>


                <span>
                    ₹${formatPrice(
                        item.price
                    )}
                    ×
                    ${item.quantity}
                </span>

            </div>


            <div
                class="checkout-item-price"
            >

                ₹${formatPrice(
                    item.total
                )}

            </div>

        `;


        container.appendChild(
            div
        );

    });

}


/* =========================
   UPDATE SUMMARY
========================= */

function updateSummary(
    items
) {

    let quantity =
        0;


    let subtotal =
        0;


    items.forEach(
        item => {

            quantity +=
                Number(
                    item.quantity
                );


            subtotal +=
                Number(
                    item.total
                );

        }
    );


    const summaryItems =
        document.getElementById(
            "summaryItems"
        );


    const subtotalElement =
        document.getElementById(
            "subtotal"
        );


    const grandTotal =
        document.getElementById(
            "grandTotal"
        );


    if (summaryItems) {

        summaryItems.textContent =
            quantity;

    }


    if (subtotalElement) {

        subtotalElement.textContent =
            `₹${formatPrice(
                subtotal
            )}`;

    }


    if (grandTotal) {

        grandTotal.textContent =
            `₹${formatPrice(
                subtotal
            )}`;

    }

}


/* =========================
   PLACE ORDER
========================= */

async function placeOrder() {

    const currentToken =
        localStorage.getItem(
            "token"
        );


    if (!currentToken) {

        window.location.href =
            "login.html";

        return;

    }


    if (
        checkoutCart.length === 0
    ) {

        alert(
            "Your cart is empty."
        );

        return;

    }


    /*
     * Address required.
     */

    if (!selectedAddress) {

        alert(
            "Please select or add a delivery address."
        );

        return;

    }


    const paymentElement =
        document.querySelector(
            'input[name="payment"]:checked'
        );


    const paymentMethod =
        paymentElement
            ? paymentElement.value
            : "cod";


    const button =
        document.getElementById(
            "placeOrderBtn"
        );


    if (button) {

        button.disabled =
            true;

        button.textContent =
            "Placing Order...";

    }


    try {

        const response =
            await fetch(
                `${API_URL}/api/orders`,
                {
                    method: "POST",

                    headers: {

                        "Content-Type":
                            "application/json",

                        "Authorization":
                            `Bearer ${currentToken}`

                    },

                    body:
                        JSON.stringify({

                            full_name:
                                selectedAddress.full_name,

                            phone:
                                selectedAddress.phone,

                            address:
                                selectedAddress.address_line,

                            city:
                                selectedAddress.city,

                            state:
                                selectedAddress.state,

                            pincode:
                                selectedAddress.pincode,

                            country:
                                selectedAddress.country ||
                                "India",

                            payment_method:
                                paymentMethod

                        })

                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data.error ||
                data.message ||
                "Order could not be placed."
            );

        }


        /*
         * Order ID
         */

        const orderId =
            data.order_id ||
            data.order?.id;


        if (!orderId) {

            throw new Error(
                "Order created but Order ID was not returned."
            );

        }


        localStorage.setItem(
            "lastOrderId",
            orderId
        );


        /*
         * Success page
         */

        window.location.href =
            `order-success.html?order_id=${orderId}`;


    } catch (error) {

        console.error(
            "Place Order Error:",
            error
        );


        alert(
            "❌ " +
            error.message
        );


        if (button) {

            button.disabled =
                false;

            button.textContent =
                "Place Order →";

        }

    }

}


/* =========================
   CART COUNT
========================= */

async function loadCartCount() {

    const cartCount =
        document.getElementById(
            "cartCount"
        );


    if (!cartCount) {
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
   ADDRESS BUTTON EVENTS
========================= */

function setupAddressEvents() {

    const changeAddressBtn =
        document.getElementById(
            "changeAddressBtn"
        );


    const addAddressBtn =
        document.getElementById(
            "addAddressBtn"
        );


    const closeAddressSelectorBtn =
        document.getElementById(
            "closeAddressSelector"
        );


    const saveCheckoutAddressBtn =
        document.getElementById(
            "saveCheckoutAddress"
        );


    const cancelCheckoutAddressBtn =
        document.getElementById(
            "cancelCheckoutAddress"
        );


    if (changeAddressBtn) {

        changeAddressBtn.addEventListener(
            "click",
            openAddressSelector
        );

    }


    if (addAddressBtn) {

        addAddressBtn.addEventListener(
            "click",
            openNewAddressForm
        );

    }


    if (
        closeAddressSelectorBtn
    ) {

        closeAddressSelectorBtn.addEventListener(
            "click",
            closeAddressSelector
        );

    }


    if (
        saveCheckoutAddressBtn
    ) {

        saveCheckoutAddressBtn.addEventListener(
            "click",
            saveCheckoutAddress
        );

    }


    if (
        cancelCheckoutAddressBtn
    ) {

        cancelCheckoutAddressBtn.addEventListener(
            "click",
            closeNewAddressForm
        );

    }

}


/* =========================
   SEARCH
========================= */

function setupSearch() {

    const searchBtn =
        document.getElementById(
            "searchBtn"
        );


    const searchInput =
        document.getElementById(
            "searchInput"
        );


    if (searchBtn) {

        searchBtn.addEventListener(
            "click",
            () => {

                const query =
                    searchInput
                        ?.value
                        .trim();


                if (!query) {
                    return;
                }


                window.location.href =
                    `shop.html?search=${encodeURIComponent(
                        query
                    )}`;

            }
        );

    }


    if (searchInput) {

        searchInput.addEventListener(
            "keydown",
            event => {

                if (
                    event.key === "Enter"
                ) {

                    searchBtn?.click();

                }

            }
        );

    }

}


/* =========================
   HELPERS
========================= */

function isAddressDefault(
    address
) {

    return (
        address &&
        (
            address.is_default === true ||
            address.is_default === "true"
        )
    );

}


function getAddressIcon(
    type
) {

    switch (
        String(
            type || ""
        ).toLowerCase()
    ) {

        case "office":

            return "🏢";

        case "other":

            return "📍";

        default:

            return "🏠";

    }

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


function getValue(
    id
) {

    const element =
        document.getElementById(
            id
        );


    return (
        element?.value
            ?.trim() || ""
    );

}


function setValue(
    id,
    value
) {

    const element =
        document.getElementById(
            id
        );


    if (element) {

        element.value =
            value ?? "";

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


/* =========================
   START
========================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        console.log(
            "CHECKOUT JS NEW VERSION LOADED"
        );


        setupAddressEvents();

        setupSearch();

        loadCheckoutCart();

        loadCartCount();


        const placeOrderBtn =
            document.getElementById(
                "placeOrderBtn"
            );


        if (placeOrderBtn) {

            placeOrderBtn.addEventListener(
                "click",
                placeOrder
            );

        }

    }
);