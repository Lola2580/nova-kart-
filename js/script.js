const API_URL = "http://localhost:5000";

/* =========================
   LOAD PRODUCTS
========================= */

async function loadProducts() {

    const productContainer =
        document.getElementById("productContainer");

    try {

        productContainer.innerHTML = `
            <div class="loading">
                Loading products...
            </div>
        `;

        const response =
            await fetch(`${API_URL}/api/products`);

        if (!response.ok) {
            throw new Error("Failed to load products");
        }

        const data = await response.json();

        /*
          API agar direct array return kare:
          [ product1, product2 ]

          ya object ke andar products:
          { products: [...] }

          dono handle honge.
        */

        const products =
            Array.isArray(data)
                ? data
                : data.products || [];

        if (products.length === 0) {

            productContainer.innerHTML = `
                <div class="loading">
                    No products found.
                </div>
            `;

            return;
        }

        displayProducts(products);

    } catch (error) {

        console.error("Product Error:", error);

        productContainer.innerHTML = `
            <div class="loading">
                ❌ Products load nahi ho pa rahe.
                <br>
                Check karo server running hai ya nahi.
            </div>
        `;
    }
}


/* =========================
   DISPLAY PRODUCTS
========================= */

function displayProducts(products) {

    const productContainer =
        document.getElementById("productContainer");

    productContainer.innerHTML = "";

    products.forEach(product => {

        const card =
            document.createElement("div");

        card.className = "product-card";

        card.innerHTML = `

            <div class="product-image">

                <img
                    src="${product.image_url || "https://via.placeholder.com/500x500?text=No+Image"}"
                    alt="${escapeHTML(product.name)}"
                    loading="lazy"
                    onerror="this.src='https://via.placeholder.com/500x500?text=No+Image'"
                >

            </div>


            <div class="product-info">

                <h3>
                    ${escapeHTML(product.name)}
                </h3>

                <p>
                    ${escapeHTML(
                        product.description ||
                        "Premium quality product"
                    )}
                </p>


                <div class="product-price">

                    <strong>
                        ₹${Number(product.price).toLocaleString("en-IN")}
                    </strong>

                    <button
                        onclick="addToCart(${product.id})"
                    >
                        Add to Cart
                    </button>

                </div>

            </div>

        `;

        productContainer.appendChild(card);

    });
}


/* =========================
   ADD TO CART
========================= */

async function addToCart(productId) {

    const token =
        localStorage.getItem("token");

    if (!token) {

        alert("Please login first.");

        window.location.href =
            "login.html";

        return;
    }


    try {

        const response =
            await fetch(`${API_URL}/api/cart`, {

                method: "POST",

                headers: {

                    "Content-Type":
                        "application/json",

                    "Authorization":
                        `Bearer ${token}`
                },

                body: JSON.stringify({

                    product_id: productId,

                    quantity: 1

                })

            });


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data.error ||
                "Unable to add product"
            );
        }


        alert("✅ Product added to cart");

        updateCartCount();

    } catch (error) {

        console.error(
            "Cart Error:",
            error
        );

        alert(
            "❌ " + error.message
        );
    }
}


/* =========================
   CART COUNT
========================= */

async function updateCartCount() {

    const token =
        localStorage.getItem("token");

    const cartCount =
        document.getElementById("cartCount");


    if (!token) {

        cartCount.textContent = "0";

        return;
    }


    try {

        const response =
            await fetch(`${API_URL}/api/cart`, {

                headers: {

                    "Authorization":
                        `Bearer ${token}`
                }

            });


        if (!response.ok) {

            cartCount.textContent = "0";

            return;
        }


        const data =
            await response.json();


        const items =
            data.cart_items || [];


        const totalQuantity =
            items.reduce(
                (total, item) =>
                    total + Number(item.quantity),
                0
            );


        cartCount.textContent =
            totalQuantity;

    } catch (error) {

        console.error(
            "Cart Count Error:",
            error
        );

        cartCount.textContent = "0";
    }
}


/* =========================
   PRODUCT SLIDER
========================= */

const productContainer =
    document.getElementById(
        "productContainer"
    );

const previousButton =
    document.getElementById(
        "prevProducts"
    );

const nextButton =
    document.getElementById(
        "nextProducts"
    );


if (previousButton) {

    previousButton.addEventListener(
        "click",
        () => {

            productContainer.scrollBy({

                left: -350,

                behavior: "smooth"

            });

        }
    );

}


if (nextButton) {

    nextButton.addEventListener(
        "click",
        () => {

            productContainer.scrollBy({

                left: 350,

                behavior: "smooth"

            });

        }
    );

}


/* =========================
   SEARCH
========================= */

const searchInput =
    document.getElementById(
        "searchInput"
    );

const searchButton =
    document.getElementById(
        "searchBtn"
    );


async function searchProducts() {

    const searchText =
        searchInput.value
            .trim()
            .toLowerCase();


    try {

        const response =
            await fetch(
                `${API_URL}/api/products`
            );


        const data =
            await response.json();


        const products =
            Array.isArray(data)
                ? data
                : data.products || [];


        if (!searchText) {

            displayProducts(products);

            return;
        }


        const filteredProducts =
            products.filter(product => {

                const name =
                    (product.name || "")
                        .toLowerCase();

                const category =
                    (product.category || "")
                        .toLowerCase();

                const description =
                    (product.description || "")
                        .toLowerCase();


                return (
                    name.includes(searchText) ||
                    category.includes(searchText) ||
                    description.includes(searchText)
                );

            });


        displayProducts(
            filteredProducts
        );


    } catch (error) {

        console.error(
            "Search Error:",
            error
        );

    }
}


if (searchButton) {

    searchButton.addEventListener(
        "click",
        searchProducts
    );

}


if (searchInput) {

    searchInput.addEventListener(
        "keydown",
        event => {

            if (event.key === "Enter") {

                searchProducts();

            }

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

        loadProducts();

        updateCartCount();

    }
);