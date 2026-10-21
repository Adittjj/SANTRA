const mongoose = require("mongoose");

const User = mongoose.model("User", new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true }
}, { timestamps: true }));

const Product = mongoose.model("Product", new mongoose.Schema({
    name: String,
    category: String,
    method: String,
    price: Number,
    oldPrice: Number,
    trees: Number,
    detail: String,
    image: String
}, { timestamps: true }));

const Donation = mongoose.model("Donation", new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    name: String,
    phone: String,
    address: String,
    city: String,
    date: String,
    count: Number,
    certName: String
}, { timestamps: true }));

const Order = mongoose.model("Order", new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    orderNumber: String,
    items: [{
        product: mongoose.Schema.Types.ObjectId,
        name: String,
        price: Number,
        trees: Number,
        quantity: Number
    }],
    total: Number,
    trees: Number,
    name: String,
    phone: String,
    address: String,
    paymentMethod: { type: String, default: "Cash on delivery" },
    status: { type: String, enum: ["Placed", "Packed", "Shipped", "Delivered", "Cancelled"], default: "Placed" }
}, { timestamps: true }));

module.exports = { User, Product, Donation, Order };
