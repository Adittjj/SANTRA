require("dotenv").config();
const mongoose = require("mongoose");
const { Product } = require("./models");

const products = [
    { name: "Regrown Wool Coat", category: "Coats", method: "Remade", price: 4999, oldPrice: 8400, trees: 4, detail: "Woven from 4 donated coats, Panipat mill" },
    { name: "Re-Spun Silk Knit", category: "Knitwear", method: "Remade", price: 2699, oldPrice: 4100, trees: 3, detail: "Woven from 3 donated saris, Bhiwandi" },
    { name: "Second Life Trousers", category: "Trousers", method: "Remade", price: 3299, oldPrice: 5200, trees: 2, detail: "Woven from 2 donated denim pairs" },
    { name: "Mended Leather Boots", category: "Footwear", method: "Repaired", price: 5899, oldPrice: 9900, trees: 1, detail: "Resoled and recoloured, Kanpur workshop" },
    { name: "Offcut Patchwork Shirt", category: "Shirts", method: "Patchwork", price: 1899, oldPrice: 3000, trees: 2, detail: "Cut from 11 cotton offcuts, no two alike" },
    { name: "Indigo Overdyed Slip", category: "Dresses", method: "Overdyed", price: 2150, oldPrice: 3600, trees: 1, detail: "Stained original, redyed with plant indigo" },
    { name: "Long Recovery Overcoat", category: "Coats", method: "Remade", price: 6499, oldPrice: 11200, trees: 6, detail: "Woven from 6 donated blankets and coats" },
    { name: "Winter Recovery Cardigan", category: "Knitwear", method: "Remade", price: 3450, oldPrice: 5800, trees: 3, detail: "Woven from 3 donated jumpers, Ludhiana" },
    { name: "Visible Mend Work Trousers", category: "Trousers", method: "Repaired", price: 1750, oldPrice: 3400, trees: 1, detail: "Sashiko-stitched knee repair, one pair only" },
    { name: "Monsoon Remade Dress", category: "Dresses", method: "Remade", price: 2899, oldPrice: 4700, trees: 2, detail: "Woven from 2 donated cotton kurtas" },
    { name: "Loom Waste Scarf", category: "Accessories", method: "Patchwork", price: 899, oldPrice: 1600, trees: 1, detail: "Woven from mill floor sweepings" },
    { name: "Resoled Everyday Shoe", category: "Footwear", method: "Repaired", price: 2999, oldPrice: 6200, trees: 1, detail: "New cork sole on a donated upper" }
];

async function run() {
    await mongoose.connect(process.env.MONGO_URI);
    await Product.deleteMany({});
    products.forEach(p => p.image = "images/" + p.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") + ".jpg");
    await Product.insertMany(products);
    console.log("Added " + products.length + " products");
    process.exit(0);
}
run();
