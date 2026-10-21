require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { User, Product, Donation, Order } = require("./models");

const app = express();
app.use(express.json());
app.use(express.static("public"));

mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("MongoDB connected"))
    .catch(err => {
        console.log("MongoDB error:", err.message);
        process.exit(1);
    });

// same rules as the browser, checked again here
function emailOk(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
function passwordError(p) {
    if (p.length < 8) return "Password must be at least 8 characters.";
    if (!/[A-Z]/.test(p)) return "Password needs an uppercase letter.";
    if (!/[a-z]/.test(p)) return "Password needs a lowercase letter.";
    if (!/[0-9]/.test(p)) return "Password needs a number.";
    if (!/[^A-Za-z0-9]/.test(p)) return "Password needs a special character.";
    return "";
}

// if a login token is sent, remember who it is
function readToken(req, res, next) {
    const header = req.headers.authorization || "";
    try {
        req.userId = jwt.verify(header.replace("Bearer ", ""), process.env.JWT_SECRET).id;
    } catch (err) {
        req.userId = null;
    }
    next();
}

// register
app.post("/api/register", async (req, res) => {
    const email = String(req.body.email || "").trim().toLowerCase();
    const password = String(req.body.password || "");

    if (!emailOk(email)) return res.status(400).json({ message: "Enter a valid email." });
    if (passwordError(password)) return res.status(400).json({ message: passwordError(password) });
    if (await User.findOne({ email })) return res.status(400).json({ message: "That email is already registered." });

    await User.create({ email, password: await bcrypt.hash(password, 10) });
    res.json({ message: "Account created" });
});

// login
app.post("/api/login", async (req, res) => {
    const email = String(req.body.email || "").trim().toLowerCase();
    const password = String(req.body.password || "");

    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password))) {
        return res.status(400).json({ message: "Wrong email or password." });
    }
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });
    res.json({ token, email: user.email });
});

// products
app.get("/api/products", async (req, res) => {
    const limit = Number(req.query.limit) || 0;
    res.json(await Product.find().limit(limit));
});

// donations (works with or without login)
app.post("/api/donations", readToken, async (req, res) => {
    const { name, phone, address, city, date, count, certName } = req.body;
    if (!name || !phone || !address || !city || !date || !(count >= 1)) {
        return res.status(400).json({ message: "Please fill in everything." });
    }
    await Donation.create({ user: req.userId, name, phone, address, city, date, count, certName });
    res.json({ message: "Pickup booked", trees: count });
});

// ---------- orders ----------
function needLogin(req, res, next) {
    if (!req.userId) return res.status(401).json({ message: "Please log in." });
    next();
}

// place an order from the cart
app.post("/api/orders", readToken, needLogin, async (req, res) => {
    const { items, name, phone, address } = req.body;
    if (!Array.isArray(items) || items.length === 0) return res.status(400).json({ message: "Your cart is empty." });
    if (!name || !phone || !address) return res.status(400).json({ message: "Please fill in everything." });

    const orderItems = [];
    let total = 0;
    let trees = 0;

    for (const item of items) {
        const quantity = Number(item.quantity);
        if (!(quantity >= 1 && quantity <= 10)) return res.status(400).json({ message: "Quantity must be 1 to 10." });

        // price comes from the database, not from the browser
        const product = await Product.findById(item.productId).catch(() => null);
        if (!product) return res.status(404).json({ message: "A product in your cart is no longer available." });

        orderItems.push({ product: product._id, name: product.name, price: product.price, trees: product.trees, quantity });
        total += product.price * quantity;
        trees += product.trees * quantity;
    }

    const order = await Order.create({
        user: req.userId,
        orderNumber: "SAN-" + Math.floor(100000 + Math.random() * 900000),
        items: orderItems,
        total, trees, name, phone, address
    });
    res.json({ orderNumber: order.orderNumber, total, trees });
});

// my orders
app.get("/api/orders", readToken, needLogin, async (req, res) => {
    res.json(await Order.find({ user: req.userId }).sort({ createdAt: -1 }));
});

// cancel an order (only before it is packed)
app.put("/api/orders/:id/cancel", readToken, needLogin, async (req, res) => {
    const order = await Order.findOne({ _id: req.params.id, user: req.userId }).catch(() => null);
    if (!order) return res.status(404).json({ message: "Order not found." });
    if (order.status !== "Placed") return res.status(400).json({ message: "This order can no longer be cancelled." });
    order.status = "Cancelled";
    await order.save();
    res.json({ message: "Order cancelled" });
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log("Open http://localhost:" + port));
