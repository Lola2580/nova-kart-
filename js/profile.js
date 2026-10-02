const API_URL = "http://localhost:5000";


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
   LOAD PROFILE
========================= */

async function loadProfile() {

    try {

        const response =
            await fetch(
                `${API_URL}/api/profile`,
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
                "Failed to load profile"
            );

        }


        const user =
            data.user || data;


        /* =====================
           BASIC INFORMATION
        ===================== */

        const name =
            user.name ||
            user.full_name ||
            "User";


        const email =
            user.email ||
            "—";


        const phone =
            user.phone &&
            String(user.phone).trim()
                ? user.phone
                : "Not added";


        /* =====================
           PROFILE TEXT
        ===================== */

        setText(
            "profileName",
            name
        );


        setText(
            "profileEmail",
            email
        );


        setText(
            "detailName",
            name
        );


        setText(
            "detailEmail",
            email
        );


        setText(
            "detailPhone",
            phone
        );


        /* =====================
           DEFAULT PROFILE PHOTO
        ===================== */

        const defaultImage =
            "images/profile-default.png";


        const profileImage =
            document.getElementById(
                "profileImage"
            );


        if (profileImage) {

            profileImage.src =
                defaultImage;

        }


        /* =====================
           EDIT FORM
        ===================== */

        const editName =
            document.getElementById(
                "editName"
            );


        const editPhone =
            document.getElementById(
                "editPhone"
            );


        if (editName) {

            editName.value =
                user.name ||
                user.full_name ||
                "";

        }


        if (editPhone) {

            editPhone.value =
                user.phone || "";

        }


    } catch (error) {

        console.error(
            "Profile Error:",
            error
        );


        setText(
            "profileName",
            "Unable to load"
        );


        setText(
            "profileEmail",
            error.message
        );

    }

}


/* =========================
   EDIT PROFILE MODAL
========================= */

const editProfileBtn =
    document.getElementById(
        "editProfileBtn"
    );


const profileModal =
    document.getElementById(
        "profileModal"
    );


const closeModalBtn =
    document.getElementById(
        "closeModal"
    );


if (editProfileBtn) {

    editProfileBtn.addEventListener(
        "click",
        () => {

            if (profileModal) {

                profileModal.classList.add(
                    "show"
                );

            }

        }
    );

}


if (closeModalBtn) {

    closeModalBtn.addEventListener(
        "click",
        () => {

            if (profileModal) {

                profileModal.classList.remove(
                    "show"
                );

            }

        }
    );

}


if (profileModal) {

    profileModal.addEventListener(
        "click",
        event => {

            if (
                event.target ===
                profileModal
            ) {

                profileModal.classList.remove(
                    "show"
                );

            }

        }
    );

}


/* =========================
   UPDATE PROFILE
========================= */

const profileForm =
    document.getElementById(
        "profileForm"
    );


if (profileForm) {

    profileForm.addEventListener(
        "submit",
        async event => {

            event.preventDefault();


            const name =
                document
                    .getElementById(
                        "editName"
                    )
                    .value
                    .trim();


            const phone =
                document
                    .getElementById(
                        "editPhone"
                    )
                    .value
                    .trim();


            /* =====================
               VALIDATION
            ===================== */

            if (!name) {

                alert(
                    "Please enter your name."
                );

                return;

            }


            if (
                phone &&
                !/^[0-9]{10}$/.test(
                    phone
                )
            ) {

                alert(
                    "Please enter a valid 10-digit phone number."
                );

                return;

            }


            /* =====================
               SAVE BUTTON
            ===================== */

            const saveButton =
                document.querySelector(
                    ".save-profile-btn"
                );


            if (saveButton) {

                saveButton.disabled =
                    true;

                saveButton.textContent =
                    "Saving...";

            }


            try {

                /* =====================
                   ONLY NAME + PHONE
                ===================== */

                const response =
                    await fetch(
                        `${API_URL}/api/profile`,
                        {
                            method: "PUT",

                            headers: {

                                "Content-Type":
                                    "application/json",

                                "Authorization":
                                    `Bearer ${token}`

                            },

                            body:
                                JSON.stringify({

                                    name:
                                        name,

                                    phone:
                                        phone

                                })

                        }
                    );


                const data =
                    await response.json();


                if (!response.ok) {

                    throw new Error(
                        data.error ||
                        "Failed to update profile"
                    );

                }


                alert(
                    "✅ Profile updated successfully!"
                );


                if (profileModal) {

                    profileModal.classList.remove(
                        "show"
                    );

                }


                /*
                 * Reload profile from database
                 */

                await loadProfile();


            } catch (error) {

                console.error(
                    "Update Profile Error:",
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
                        "Save Changes";

                }

            }

        }
    );

}


/* =========================
   CHANGE PASSWORD
========================= */

const changePasswordBtn =
    document.getElementById(
        "changePasswordBtn"
    );


if (changePasswordBtn) {

    changePasswordBtn.addEventListener(
        "click",
        () => {

            window.location.href =
                "change-password.html";

        }
    );

}


/* =========================
   LOGOUT
========================= */

const logoutBtn =
    document.getElementById(
        "logoutBtn"
    );


if (logoutBtn) {

    logoutBtn.addEventListener(
        "click",
        () => {

            const confirmLogout =
                confirm(
                    "Are you sure you want to logout?"
                );


            if (!confirmLogout) {
                return;
            }


            localStorage.removeItem(
                "token"
            );


            localStorage.removeItem(
                "user"
            );


            window.location.href =
                "login.html";

        }
    );

}


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
            (
                data.wishlist ||
                []
            ).length;


        const wishlistCount =
            document.getElementById(
                "wishlistCount"
            );


        if (wishlistCount) {

            wishlistCount.textContent =
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


/* =========================
   HELPER
========================= */

function setText(
    id,
    value
) {

    const element =
        document.getElementById(
            id
        );


    if (element) {

        element.textContent =
            value ?? "—";

    }

}


/* =========================
   START
========================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        loadProfile();

        loadCartCount();

        loadWishlistCount();

    }
);