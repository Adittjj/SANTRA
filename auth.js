// Register and login talk to the server (which saves to MongoDB).

function showError(message) {
    document.getElementById("error").textContent = message;
}

function checkEmail(email) {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return "Enter a valid email.";
    return "";
}

function checkPassword(password) {
    if (password.length < 8) return "Password must be at least 8 characters.";
    if (!/[A-Z]/.test(password)) return "Password needs an uppercase letter.";
    if (!/[a-z]/.test(password)) return "Password needs a lowercase letter.";
    if (!/[0-9]/.test(password)) return "Password needs a number.";
    if (!/[^A-Za-z0-9]/.test(password)) return "Password needs a special character (like ! or @).";
    return "";
}

async function sendToServer(url, email, password) {
    const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
    });
    const data = await response.json();
    return { ok: response.ok, data };
}

async function register(event) {
    event.preventDefault();
    const email = document.getElementById("email").value.trim().toLowerCase();
    const password = document.getElementById("password").value;
    const confirm = document.getElementById("confirm").value;

    const error = checkEmail(email) || checkPassword(password);
    if (error) return showError(error);
    if (password !== confirm) return showError("Passwords do not match.");

    try {
        const result = await sendToServer("/api/register", email, password);
        if (!result.ok) return showError(result.data.message);
        alert("Account created! Please log in.");
        window.location.href = "login.html";
    } catch (err) {
        showError("Cannot reach the server.");
    }
}

async function login(event) {
    event.preventDefault();
    const email = document.getElementById("email").value.trim().toLowerCase();
    const password = document.getElementById("password").value;

    try {
        const result = await sendToServer("/api/login", email, password);
        if (!result.ok) return showError(result.data.message);
        localStorage.setItem("token", result.data.token);
        localStorage.setItem("email", result.data.email);
        alert("Welcome back!");
        window.location.href = "index.html";
    } catch (err) {
        showError("Cannot reach the server.");
    }
}
