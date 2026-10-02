const API_URL = "http://localhost:5000";


/* =========================
   VARIABLES
========================= */

let resetEmail = "";
let resetToken = "";


/* =========================
   ELEMENTS
========================= */

const emailStep =
    document.getElementById(
        "emailStep"
    );

const codeStep =
    document.getElementById(
        "codeStep"
    );

const passwordStep =
    document.getElementById(
        "passwordStep"
    );


const resetEmailInput =
    document.getElementById(
        "resetEmail"
    );

const verificationCode =
    document.getElementById(
        "verificationCode"
    );

const sentEmail =
    document.getElementById(
        "sentEmail"
    );


/* =========================
   MESSAGES
========================= */

function showMessage(
    elementId,
    message,
    type = ""
) {

    const element =
        document.getElementById(
            elementId
        );


    if (!element) {
        return;
    }


    element.textContent =
        message;


    element.className =
        `form-message ${type}`;

}


/* =========================
   STEP SWITCH
========================= */

function showStep(
    step
) {

    if (emailStep) {

        emailStep.style.display =
            "none";

    }


    if (codeStep) {

        codeStep.style.display =
            "none";

    }


    if (passwordStep) {

        passwordStep.style.display =
            "none";

    }


    if (step === "email") {

        emailStep.style.display =
            "block";

    }


    if (step === "code") {

        codeStep.style.display =
            "block";

    }


    if (step === "password") {

        passwordStep.style.display =
            "block";

    }

}


/* =========================
   SEND VERIFICATION CODE
========================= */

const sendCodeBtn =
    document.getElementById(
        "sendCodeBtn"
    );


if (sendCodeBtn) {

    sendCodeBtn.addEventListener(
        "click",
        sendVerificationCode
    );

}


async function sendVerificationCode() {

    const email =
        resetEmailInput
            ?.value
            ?.trim()
            .toLowerCase();


    if (!email) {

        showMessage(
            "sendCodeMessage",
            "Please enter your email address.",
            "error"
        );

        return;

    }


    if (
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
            email
        )
    ) {

        showMessage(
            "sendCodeMessage",
            "Please enter a valid email address.",
            "error"
        );

        return;

    }


    sendCodeBtn.disabled =
        true;


    sendCodeBtn.textContent =
        "Sending...";


    showMessage(
        "sendCodeMessage",
        "",
        ""
    );


    try {

        const response =
            await fetch(
                `${API_URL}/api/forgot-password/send-code`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify({
                            email: email
                        })
                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data.error ||
                "Unable to send verification code."
            );

        }


        resetEmail =
            email;


        if (sentEmail) {

            sentEmail.textContent =
                email;

        }


        /*
         * Move to verification step.
         */

        showStep(
            "code"
        );


        showMessage(
            "verifyCodeMessage",
            data.message ||
                "Verification code sent to your email.",
            "success"
        );


        if (verificationCode) {

            verificationCode.focus();

        }


    } catch (error) {

        console.error(
            "Send Code Error:",
            error
        );


        showMessage(
            "sendCodeMessage",
            error.message,
            "error"
        );


    } finally {

        sendCodeBtn.disabled =
            false;

        sendCodeBtn.textContent =
            "Send Verification Code";

    }

}


/* =========================
   VERIFY CODE
========================= */

const verifyCodeBtn =
    document.getElementById(
        "verifyCodeBtn"
    );


if (verifyCodeBtn) {

    verifyCodeBtn.addEventListener(
        "click",
        verifyVerificationCode
    );

}


async function verifyVerificationCode() {

    const code =
        verificationCode
            ?.value
            ?.trim();


    if (!resetEmail) {

        showStep(
            "email"
        );

        return;

    }


    if (!code) {

        showMessage(
            "verifyCodeMessage",
            "Please enter the verification code.",
            "error"
        );

        return;

    }


    if (
        !/^[0-9]{6}$/.test(
            code
        )
    ) {

        showMessage(
            "verifyCodeMessage",
            "Please enter a valid 6-digit code.",
            "error"
        );

        return;

    }


    verifyCodeBtn.disabled =
        true;


    verifyCodeBtn.textContent =
        "Verifying...";


    showMessage(
        "verifyCodeMessage",
        "",
        ""
    );


    try {

        const response =
            await fetch(
                `${API_URL}/api/forgot-password/verify-code`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify({

                            email:
                                resetEmail,

                            code:
                                code

                        })
                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data.error ||
                "Invalid verification code."
            );

        }


        /*
         * Backend should return
         * a temporary reset token.
         */

        resetToken =
            data.reset_token ||
            data.resetToken ||
            "";


        if (!resetToken) {

            throw new Error(
                "Verification succeeded but reset token was not received."
            );

        }


        showMessage(
            "verifyCodeMessage",
            "Code verified successfully.",
            "success"
        );


        showStep(
            "password"
        );


        const newPassword =
            document.getElementById(
                "newResetPassword"
            );


        if (newPassword) {

            newPassword.focus();

        }


    } catch (error) {

        console.error(
            "Verify Code Error:",
            error
        );


        showMessage(
            "verifyCodeMessage",
            error.message,
            "error"
        );


    } finally {

        verifyCodeBtn.disabled =
            false;

        verifyCodeBtn.textContent =
            "Verify Code";

    }

}


/* =========================
   RESEND CODE
========================= */

const resendCodeBtn =
    document.getElementById(
        "resendCodeBtn"
    );


if (resendCodeBtn) {

    resendCodeBtn.addEventListener(
        "click",
        async () => {

            if (!resetEmail) {

                showStep(
                    "email"
                );

                return;

            }


            /*
             * Put email back in input
             * and resend.
             */

            if (resetEmailInput) {

                resetEmailInput.value =
                    resetEmail;

            }


            await sendVerificationCode();

        }
    );

}


/* =========================
   PASSWORD TOGGLE
========================= */

const passwordToggleButtons =
    document.querySelectorAll(
        ".toggle-reset-password"
    );


passwordToggleButtons.forEach(
    button => {

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

    }
);


/* =========================
   PASSWORD RULES
========================= */

const newResetPassword =
    document.getElementById(
        "newResetPassword"
    );


const resetRuleLength =
    document.getElementById(
        "resetRuleLength"
    );


const resetRuleLetter =
    document.getElementById(
        "resetRuleLetter"
    );


const resetRuleNumber =
    document.getElementById(
        "resetRuleNumber"
    );


if (newResetPassword) {

    newResetPassword.addEventListener(
        "input",
        () => {

            const password =
                newResetPassword.value;


            updatePasswordRule(
                resetRuleLength,
                password.length >= 8,
                "At least 8 characters"
            );


            updatePasswordRule(
                resetRuleLetter,
                /[A-Za-z]/.test(
                    password
                ),
                "At least one letter"
            );


            updatePasswordRule(
                resetRuleNumber,
                /[0-9]/.test(
                    password
                ),
                "At least one number"
            );

        }
    );

}


/* =========================
   UPDATE PASSWORD RULE
========================= */

function updatePasswordRule(
    element,
    valid,
    text
) {

    if (!element) {
        return;
    }


    element.classList.toggle(
        "valid",
        valid
    );


    element.textContent =
        valid
            ? `✓ ${text}`
            : `• ${text}`;

}


/* =========================
   RESET PASSWORD
========================= */

const resetPasswordBtn =
    document.getElementById(
        "resetPasswordBtn"
    );


if (resetPasswordBtn) {

    resetPasswordBtn.addEventListener(
        "click",
        resetPassword
    );

}


async function resetPassword() {

    const newPassword =
        document.getElementById(
            "newResetPassword"
        )?.value || "";


    const confirmPassword =
        document.getElementById(
            "confirmResetPassword"
        )?.value || "";


    /* =====================
       VALIDATION
    ===================== */

    if (
        !newPassword ||
        !confirmPassword
    ) {

        showMessage(
            "resetPasswordMessage",
            "Please fill both password fields.",
            "error"
        );

        return;

    }


    if (
        newPassword.length < 8
    ) {

        showMessage(
            "resetPasswordMessage",
            "Password must be at least 8 characters.",
            "error"
        );

        return;

    }


    if (
        !/[A-Za-z]/.test(
            newPassword
        )
    ) {

        showMessage(
            "resetPasswordMessage",
            "Password must contain at least one letter.",
            "error"
        );

        return;

    }


    if (
        !/[0-9]/.test(
            newPassword
        )
    ) {

        showMessage(
            "resetPasswordMessage",
            "Password must contain at least one number.",
            "error"
        );

        return;

    }


    if (
        newPassword !==
        confirmPassword
    ) {

        showMessage(
            "resetPasswordMessage",
            "Passwords do not match.",
            "error"
        );

        return;

    }


    if (!resetToken) {

        showMessage(
            "resetPasswordMessage",
            "Please verify the code first.",
            "error"
        );

        return;

    }


    resetPasswordBtn.disabled =
        true;


    resetPasswordBtn.textContent =
        "Resetting Password...";


    showMessage(
        "resetPasswordMessage",
        "",
        ""
    );


    try {

        const response =
            await fetch(
                `${API_URL}/api/forgot-password/reset`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify({

                            reset_token:
                                resetToken,

                            password:
                                newPassword

                        })
                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data.error ||
                "Unable to reset password."
            );

        }


        showMessage(
            "resetPasswordMessage",
            "✅ Password reset successfully. Redirecting to login...",
            "success"
        );


        /*
         * Small delay so user
         * can see success message.
         */

        setTimeout(
            () => {

                window.location.href =
                    "login.html";

            },
            1800
        );


    } catch (error) {

        console.error(
            "Reset Password Error:",
            error
        );


        showMessage(
            "resetPasswordMessage",
            error.message,
            "error"
        );


    } finally {

        resetPasswordBtn.disabled =
            false;

        resetPasswordBtn.textContent =
            "Reset Password";

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
                            `Bearer ${localStorage.getItem(
                                "token"
                            )}`
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
                        item.quantity ||
                        0
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

        /*
         * Always start from
         * Email step.
         */

        showStep(
            "email"
        );


        loadCartCount();

    }
);