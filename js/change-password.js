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
   FORM
========================= */

const form =
    document.getElementById(
        "changePasswordForm"
    );


/* =========================
   PASSWORD TOGGLE
========================= */

const toggleButtons =
    document.querySelectorAll(
        ".toggle-password"
    );


toggleButtons.forEach(button => {

    button.addEventListener(
        "click",
        () => {

            const targetId =
                button.dataset.target;


            const input =
                document.getElementById(
                    targetId
                );


            if (!input) {
                return;
            }


            if (
                input.type ===
                "password"
            ) {

                input.type =
                    "text";

                button.textContent =
                    "🙈";

            } else {

                input.type =
                    "password";

                button.textContent =
                    "👁";

            }

        }
    );

});


/* =========================
   PASSWORD RULES
========================= */

const newPasswordInput =
    document.getElementById(
        "newPassword"
    );


const ruleLength =
    document.getElementById(
        "ruleLength"
    );


const ruleLetter =
    document.getElementById(
        "ruleLetter"
    );


const ruleNumber =
    document.getElementById(
        "ruleNumber"
    );


if (newPasswordInput) {

    newPasswordInput.addEventListener(
        "input",
        () => {

            const password =
                newPasswordInput.value;


            const hasLength =
                password.length >= 8;


            const hasLetter =
                /[A-Za-z]/.test(
                    password
                );


            const hasNumber =
                /[0-9]/.test(
                    password
                );


            updateRule(
                ruleLength,
                hasLength
            );


            updateRule(
                ruleLetter,
                hasLetter
            );


            updateRule(
                ruleNumber,
                hasNumber
            );

        }
    );

}


/* =========================
   UPDATE RULE UI
========================= */

function updateRule(
    element,
    valid
) {

    if (!element) {
        return;
    }


    if (valid) {

        element.classList.add(
            "valid"
        );

        element.textContent =
            "✓ " +
            element.textContent
                .replace(
                    /^•\s*/,
                    ""
                )
                .replace(
                    /^✓\s*/,
                    ""
                );

    } else {

        element.classList.remove(
            "valid"
        );

        element.textContent =
            "• " +
            element.textContent
                .replace(
                    /^•\s*/,
                    ""
                )
                .replace(
                    /^✓\s*/,
                    ""
                );

    }

}


/* =========================
   CHANGE PASSWORD
========================= */

if (form) {

    form.addEventListener(
        "submit",
        async event => {

            event.preventDefault();


            const currentPassword =
                document
                    .getElementById(
                        "currentPassword"
                    )
                    .value;


            const newPassword =
                document
                    .getElementById(
                        "newPassword"
                    )
                    .value;


            const confirmPassword =
                document
                    .getElementById(
                        "confirmPassword"
                    )
                    .value;


            /* =====================
               VALIDATION
            ===================== */

            if (
                !currentPassword ||
                !newPassword ||
                !confirmPassword
            ) {

                alert(
                    "Please fill all password fields."
                );

                return;

            }


            if (
                newPassword.length < 8
            ) {

                alert(
                    "New password must be at least 8 characters."
                );

                return;

            }


            if (
                !/[A-Za-z]/.test(
                    newPassword
                )
            ) {

                alert(
                    "New password must contain at least one letter."
                );

                return;

            }


            if (
                !/[0-9]/.test(
                    newPassword
                )
            ) {

                alert(
                    "New password must contain at least one number."
                );

                return;

            }


            if (
                newPassword ===
                currentPassword
            ) {

                alert(
                    "New password must be different from current password."
                );

                return;

            }


            if (
                newPassword !==
                confirmPassword
            ) {

                alert(
                    "New passwords do not match."
                );

                return;

            }


            /* =====================
               BUTTON
            ===================== */

            const button =
                document.getElementById(
                    "changePasswordBtn"
                );


            if (button) {

                button.disabled =
                    true;

                button.textContent =
                    "Changing Password...";

            }


            try {

                const response =
                    await fetch(
                        `${API_URL}/api/change-password`,
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

                                    current_password:
                                        currentPassword,

                                    new_password:
                                        newPassword

                                })

                        }
                    );


                const data =
                    await response.json();


                if (!response.ok) {

                    throw new Error(
                        data.error ||
                        "Unable to change password."
                    );

                }


                alert(
                    "✅ Password changed successfully!"
                );


                form.reset();


                window.location.href =
                    "profile.html";


            } catch (error) {

                console.error(
                    "Change Password Error:",
                    error
                );


                alert(
                    "❌ " +
                    error.message
                );


            } finally {

                if (button) {

                    button.disabled =
                        false;

                    button.textContent =
                        "Change Password";

                }

            }

        }
    );

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
                event.key ===
                "Enter"
            ) {

                searchBtn?.click();

            }

        }
    );

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
   START
========================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        loadCartCount();

    }
);