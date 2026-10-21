// Cart is kept in the browser. Used on every page.

function getCart() {
    return JSON.parse(localStorage.getItem("cart") || "[]");
}

function saveCart(cart) {
    localStorage.setItem("cart", JSON.stringify(cart));
    updateCartCount();
}

function addToCart(product) {
    const cart = getCart();
    const found = cart.find(item => item.id === product.id);
    if (found) {
        if (found.quantity < 10) found.quantity++;
    } else {
        cart.push({ id: product.id, name: product.name, price: product.price, trees: product.trees, quantity: 1 });
    }
    saveCart(cart);
}

function updateCartCount() {
    const total = getCart().reduce((sum, item) => sum + item.quantity, 0);
    const el = document.getElementById("cartCount");
    if (el) el.textContent = total;
}

// show Logout instead of Login when signed in
function setupNav() {
    if (!localStorage.getItem("token")) return;
    const login = document.querySelector('nav a[href="login.html"]');
    const register = document.querySelector('nav a[href="register.html"]');
    if (register) register.style.display = "none";
    if (login) {
        login.textContent = "Logout";
        login.href = "#";
        login.onclick = function () {
            localStorage.removeItem("token");
            localStorage.removeItem("email");
            window.location.href = "index.html";
        };
    }
}

updateCartCount();
setupNav();
