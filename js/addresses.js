const API_URL = "http://localhost:5000";

let addresses = [];
let editingAddressId = null;


/* =========================
   AUTH
========================= */

const token =
    localStorage.getItem("token");


if (!token) {

    window.location.href =
        "login.html";

}


/* =========================
   LOAD ADDRESSES
========================= */

async function loadAddresses() {

    const container =
        document.getElementById(
            "addressesContainer"
        );

    const empty =
        document.getElementById(
            "emptyAddresses"
        );


    try {

        container.innerHTML = `
            <div class="addresses-loading">

                <div class="loading-spinner"></div>

                <p>
                    Loading your addresses...
                </p>

            </div>
        `;


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
                "Unable to load addresses"
            );

        }


        addresses =
            data.addresses || [];


        renderAddresses(
            addresses
        );


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

        empty.style.display =
            "none";

    }

}


/* =========================
   RENDER ADDRESSES
========================= */

function renderAddresses(
    items
) {

    const container =
        document.getElementById(
            "addressesContainer"
        );

    const empty =
        document.getElementById(
            "emptyAddresses"
        );


    if (!items.length) {

        container.innerHTML = "";

        empty.style.display =
            "flex";

        return;
    }


    empty.style.display =
        "none";


    container.innerHTML =
        items
            .map(
                address =>
                    createAddressCard(
                        address
                    )
            )
            .join("");

}


/* =========================
   ADDRESS CARD
========================= */

function createAddressCard(
    address
) {

    const id =
        Number(address.id);


    const type =
        String(
            address.address_type ||
            address.type ||
            "home"
        ).toLowerCase();


    const icon =
        getAddressIcon(type);


    const label =
        capitalize(type);


    const isDefault =
        Boolean(
            address.is_default
        );


    return `

        <article
            class="address-card"
            data-address-id="${id}"
        >

            <div class="address-card-header">

                <div class="address-title-wrap">

                    <div class="address-type-icon">
                        ${icon}
                    </div>


                    <div class="address-title">

                        <strong>
                            ${escapeHTML(
                                label
                            )}
                        </strong>

                        <span>
                            Delivery Address
                        </span>

                    </div>

                </div>


                ${
                    isDefault
                    ? `
                        <span class="default-badge">
                            Default
                        </span>
                    `
                    : ""
                }

            </div>


            <div class="address-card-body">

                <div class="address-recipient">
                    ${escapeHTML(
                        address.full_name ||
                        address.name ||
                        "—"
                    )}
                </div>


                <div class="address-phone">
                    📞
                    ${escapeHTML(
                        address.phone ||
                        "—"
                    )}
                </div>


                <div class="address-text">

                    ${escapeHTML(
                        address.address_line ||
                        address.address ||
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

                    <br>

                    ${escapeHTML(
                        address.country ||
                        "India"
                    )}

                </div>

            </div>


            <div class="address-card-footer">

                <span class="address-created">

                    Added
                    ${formatDate(
                        address.created_at
                    )}

                </span>


                <div class="address-actions">

                    ${
                        !isDefault
                        ? `
                            <button
                                class="
                                    address-action-btn
                                    set-default-btn
                                "
                                type="button"
                                onclick="
                                    setDefaultAddress(
                                        ${id}
                                    )
                                "
                            >
                                Set Default
                            </button>
                        `
                        : ""
                    }


                    <button
                        class="
                            address-action-btn
                            edit-address-btn
                        "
                        type="button"
                        onclick="
                            openEditAddress(
                                ${id}
                            )
                        "
                    >
                        Edit
                    </button>


                    <button
                        class="
                            address-action-btn
                            delete-address-btn
                        "
                        type="button"
                        onclick="
                            deleteAddress(
                                ${id}
                            )
                        "
                    >
                        Delete
                    </button>

                </div>

            </div>

        </article>

    `;

}


/* =========================
   OPEN ADD MODAL
========================= */

function openAddAddress() {

    editingAddressId =
        null;


    document.getElementById(
        "addressModalTitle"
    ).textContent =
        "Add New Address";


    resetAddressForm();


    document.getElementById(
        "addressModal"
    ).classList.add(
        "show"
    );

}


/* =========================
   OPEN EDIT MODAL
========================= */

function openEditAddress(
    id
) {

    const address =
        addresses.find(
            item =>
                Number(item.id) ===
                Number(id)
        );


    if (!address) {

        alert(
            "Address not found."
        );

        return;
    }


    editingAddressId =
        Number(id);


    document.getElementById(
        "addressModalTitle"
    ).textContent =
        "Edit Address";


    /* =====================
       FORM VALUES
    ===================== */

    setValue(
        "addressName",
        address.full_name ||
        address.name ||
        ""
    );


    setValue(
        "addressPhone",
        address.phone ||
        ""
    );


    setValue(
        "addressLine",
        address.address_line ||
        address.address ||
        ""
    );


    setValue(
        "addressCity",
        address.city ||
        ""
    );


    setValue(
        "addressState",
        address.state ||
        ""
    );


    setValue(
        "addressPincode",
        address.pincode ||
        ""
    );


    setValue(
        "addressCountry",
        address.country ||
        "India"
    );


    document.getElementById(
        "isDefaultAddress"
    ).checked =
        Boolean(
            address.is_default
        );


    const type =
        String(
            address.address_type ||
            address.type ||
            "home"
        );


    const radio =
        document.querySelector(
            `input[name="addressType"][value="${type}"]`
        );


    if (radio) {

        radio.checked =
            true;

    }


    document.getElementById(
        "addressModal"
    ).classList.add(
        "show"
    );

}


/* =========================
   SAVE ADDRESS
========================= */

async function saveAddress(
    event
) {

    event.preventDefault();


    const fullName =
        getValue("addressName");


    const phone =
        getValue("addressPhone");


    const addressLine =
        getValue("addressLine");


    const city =
        getValue("addressCity");


    const state =
        getValue("addressState");


    const pincode =
        getValue("addressPincode");


    const country =
        getValue("addressCountry");


    const typeElement =
        document.querySelector(
            'input[name="addressType"]:checked'
        );


    const addressType =
        typeElement
            ? typeElement.value
            : "home";


    const isDefault =
        document.getElementById(
            "isDefaultAddress"
        ).checked;


    /* =====================
       VALIDATION
    ===================== */

    if (
        !fullName ||
        !phone ||
        !addressLine ||
        !city ||
        !state ||
        !pincode
    ) {

        alert(
            "Please fill all required address fields."
        );

        return;
    }


    if (
        !/^[0-9]{10}$/.test(
            phone
        )
    ) {

        alert(
            "Please enter a valid 10-digit mobile number."
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
            "saveAddressBtn"
        );


    saveButton.disabled =
        true;


    saveButton.textContent =
        "Saving...";


    try {

        const body = {

            address_type:
                addressType,

            full_name:
                fullName,

            phone:
                phone,

            address_line:
                addressLine,

            city:
                city,

            state:
                state,

            pincode:
                pincode,

            country:
                country || "India",

            is_default:
                isDefault

        };


        const url =
            editingAddressId
                ? `${API_URL}/api/addresses/${editingAddressId}`
                : `${API_URL}/api/addresses`;


        const method =
            editingAddressId
                ? "PUT"
                : "POST";


        const response =
            await fetch(
                url,
                {
                    method: method,

                    headers: {

                        "Content-Type":
                            "application/json",

                        "Authorization":
                            `Bearer ${token}`

                    },

                    body:
                        JSON.stringify(
                            body
                        )
                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data.error ||
                "Unable to save address"
            );

        }


        closeAddressModal();


        await loadAddresses();


        alert(
            editingAddressId
                ? "✅ Address updated successfully!"
                : "✅ Address added successfully!"
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

        saveButton.disabled =
            false;

        saveButton.textContent =
            "Save Address";

    }

}


/* =========================
   DELETE ADDRESS
========================= */

async function deleteAddress(
    id
) {

    const confirmDelete =
        confirm(
            "Are you sure you want to delete this address?"
        );


    if (!confirmDelete) {
        return;
    }


    try {

        const response =
            await fetch(
                `${API_URL}/api/addresses/${id}`,
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
                "Unable to delete address"
            );

        }


        addresses =
            addresses.filter(
                address =>
                    Number(
                        address.id
                    ) !== Number(id)
            );


        renderAddresses(
            addresses
        );


        alert(
            "✅ Address deleted successfully!"
        );


    } catch (error) {

        console.error(
            "Delete Address Error:",
            error
        );


        alert(
            "❌ " +
            error.message
        );

    }

}


/* =========================
   SET DEFAULT
========================= */

async function setDefaultAddress(
    id
) {

    try {

        const response =
            await fetch(
                `${API_URL}/api/addresses/${id}/default`,
                {
                    method: "PUT",

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
                "Unable to set default address"
            );

        }


        await loadAddresses();


    } catch (error) {

        console.error(
            "Default Address Error:",
            error
        );


        alert(
            "❌ " +
            error.message
        );

    }

}


/* =========================
   RESET FORM
========================= */

function resetAddressForm() {

    document.getElementById(
        "addressForm"
    ).reset();


    setValue(
        "addressCountry",
        "India"
    );


    const homeRadio =
        document.querySelector(
            'input[name="addressType"][value="home"]'
        );


    if (homeRadio) {

        homeRadio.checked =
            true;

    }


    document.getElementById(
        "isDefaultAddress"
    ).checked =
        false;

}


/* =========================
   CLOSE MODAL
========================= */

function closeAddressModal() {

    document.getElementById(
        "addressModal"
    ).classList.remove(
        "show"
    );


    editingAddressId =
        null;

}


/* =========================
   MODAL EVENTS
========================= */

document
    .getElementById(
        "addAddressBtn"
    )
    ?.addEventListener(
        "click",
        openAddAddress
    );


document
    .getElementById(
        "emptyAddAddressBtn"
    )
    ?.addEventListener(
        "click",
        openAddAddress
    );


document
    .getElementById(
        "closeAddressModal"
    )
    ?.addEventListener(
        "click",
        closeAddressModal
    );


document
    .getElementById(
        "cancelAddressBtn"
    )
    ?.addEventListener(
        "click",
        closeAddressModal
    );


document
    .getElementById(
        "addressModal"
    )
    ?.addEventListener(
        "click",
        event => {

            if (
                event.target.id ===
                "addressModal"
            ) {

                closeAddressModal();

            }

        }
    );


/* =========================
   FORM SUBMIT
========================= */

document
    .getElementById(
        "addressForm"
    )
    ?.addEventListener(
        "submit",
        saveAddress
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
        () => {

            const input =
                document.getElementById(
                    "searchInput"
                );


            const query =
                input
                    ?.value
                    .trim();


            if (!query) {
                return;
            }


            window.location.href =
                `shop.html?search=${encodeURIComponent(query)}`;

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
            "Cart Count Error:",
            error
        );

    }

}


/* =========================
   WISHLIST COUNT
========================= */

async function loadWishlistCount() {

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


        const count =
            (data.wishlist || [])
                .length;


        const element =
            document.getElementById(
                "wishlistCount"
            );


        if (element) {

            element.textContent =
                count;

        }


    } catch (error) {

        console.error(
            "Wishlist Count Error:",
            error
        );

    }

}


/* =========================
   ADDRESS ICON
========================= */

function getAddressIcon(
    type
) {

    switch (type) {

        case "office":
            return "🏢";

        case "other":
            return "📍";

        default:
            return "🏠";

    }

}


/* =========================
   HELPERS
========================= */

function getValue(id) {

    return (
        document.getElementById(id)
            ?.value
            ?.trim() || ""
    );

}


function setValue(
    id,
    value
) {

    const element =
        document.getElementById(id);


    if (element) {

        element.value =
            value ?? "";

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


function formatDate(
    value
) {

    if (!value) {
        return "—";
    }


    const date =
        new Date(value);


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return String(value);

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

        loadAddresses();

        loadCartCount();

        loadWishlistCount();

    }
);