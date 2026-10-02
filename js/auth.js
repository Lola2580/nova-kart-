const API_URL = "http://localhost:5000";

/* =========================
   REGISTER
========================= */

const registerForm = document.getElementById("registerForm");

if (registerForm) {

    registerForm.addEventListener("submit", async (event) => {

        event.preventDefault();

        const name =
            document.getElementById("name").value.trim();

        const email =
            document.getElementById("email").value.trim();

        const password =
            document.getElementById("password").value;

        const confirmPassword =
            document.getElementById("confirmPassword").value;

        const message =
            document.getElementById("authMessage");

        const button =
            document.getElementById("registerButton");


        /* Password match */

        if (password !== confirmPassword) {

            showMessage(
                "Passwords do not match.",
                "error"
            );

            return;
        }


        /* Password length */

        if (password.length < 6) {

            showMessage(
                "Password must be at least 6 characters.",
                "error"
            );

            return;
        }


        /* Loading */

        button.disabled = true;

        button.textContent = "Creating Account...";


        try {

            const response = await fetch(
                `${API_URL}/api/register`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify({
                        name,
                        email,
                        password
                    })
                }
            );


            const data = await response.json();


            if (!response.ok) {

                throw new Error(
                    data.error ||
                    data.message ||
                    "Registration failed"
                );
            }


            /* Success */

            showMessage(
                data.message ||
                "Account created successfully!",
                "success"
            );


            registerForm.reset();


            /*
             * Backend registration ke baad
             * login page par bhejenge.
             */

            setTimeout(() => {

                window.location.href = "login.html";

            }, 1500);


        } catch (error) {

            console.error(
                "Register Error:",
                error
            );

            showMessage(
                error.message,
                "error"
            );

        } finally {

            button.disabled = false;

            button.textContent =
                "Create Account";

        }

    });

}


/* =========================
   SHOW / HIDE PASSWORD
========================= */

const togglePassword =
    document.getElementById("togglePassword");

const passwordInput =
    document.getElementById("password");


if (togglePassword && passwordInput) {

    togglePassword.addEventListener(
        "click",
        () => {

            if (
                passwordInput.type ===
                "password"
            ) {

                passwordInput.type =
                    "text";

                togglePassword.textContent =
                    "🙈";

            } else {

                passwordInput.type =
                    "password";

                togglePassword.textContent =
                    "👁";

            }

        }
    );

}


/* =========================
   SHOW / HIDE CONFIRM PASSWORD
========================= */

const toggleConfirmPassword =
    document.getElementById(
        "toggleConfirmPassword"
    );

const confirmPasswordInput =
    document.getElementById(
        "confirmPassword"
    );


if (
    toggleConfirmPassword &&
    confirmPasswordInput
) {

    toggleConfirmPassword.addEventListener(
        "click",
        () => {

            if (
                confirmPasswordInput.type ===
                "password"
            ) {

                confirmPasswordInput.type =
                    "text";

                toggleConfirmPassword.textContent =
                    "🙈";

            } else {

                confirmPasswordInput.type =
                    "password";

                toggleConfirmPassword.textContent =
                    "👁";

            }

        }
    );

}


/* =========================
   MESSAGE
========================= */

function showMessage(text, type) {

    const message =
        document.getElementById(
            "authMessage"
        );


    if (!message) {
        return;
    }


    message.textContent = text;

    message.className =
        `auth-message ${type}`;

}
/* =========================
   LOGIN
========================= */

const loginForm =
    document.getElementById("loginForm");

if (loginForm) {

    loginForm.addEventListener(
        "submit",
        async (event) => {

            event.preventDefault();

            const email =
                document
                    .getElementById("email")
                    .value
                    .trim();

            const password =
                document
                    .getElementById("password")
                    .value;

            const message =
                document.getElementById(
                    "authMessage"
                );

            const button =
                document.getElementById(
                    "loginButton"
                );


            button.disabled = true;

            button.textContent =
                "Logging in...";


            try {

                const response =
                    await fetch(
                        `${API_URL}/api/login`,
                        {
                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body: JSON.stringify({
                                email,
                                password
                            })
                        }
                    );


                const data =
                    await response.json();


                if (!response.ok) {

                    throw new Error(
                        data.error ||
                        data.message ||
                        "Login failed"
                    );

                }


                /*
                 * Backend se JWT token
                 * save kar rahe hain.
                 */

                const token =
                    data.token ||
                    data.accessToken;


                if (!token) {

                    throw new Error(
                        "Login successful but token was not received."
                    );

                }


                localStorage.setItem(
                    "token",
                    token
                );


                /* User information bhi save kar sakte hain */

                if (data.user) {

                    localStorage.setItem(
                        "user",
                        JSON.stringify(data.user)
                    );

                }


                showMessage(
                    "Login successful!",
                    "success"
                );


                setTimeout(() => {

                    window.location.href =
                        "index.html";

                }, 800);


            } catch (error) {

                console.error(
                    "Login Error:",
                    error
                );

                showMessage(
                    error.message,
                    "error"
                );

            } finally {

                button.disabled = false;

                button.textContent =
                    "Login";

            }

        }
    );

}


/* =========================
   LOGIN PASSWORD TOGGLE
========================= */

const toggleLoginPassword =
    document.getElementById(
        "toggleLoginPassword"
    );

const loginPassword =
    document.getElementById(
        "password"
    );


if (
    toggleLoginPassword &&
    loginPassword
) {

    toggleLoginPassword.addEventListener(
        "click",
        () => {

            if (
                loginPassword.type ===
                "password"
            ) {

                loginPassword.type =
                    "text";

                toggleLoginPassword.textContent =
                    "🙈";

            } else {

                loginPassword.type =
                    "password";

                toggleLoginPassword.textContent =
                    "👁";

            }

        }
    );

}