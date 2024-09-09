const mongoose = require("mongoose");

const Schema = new mongoose.Schema({
    product_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
    },
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },
    product_stock_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "ProductStock",
        default: null,
    },
    quantity: {
        type: Number,
        default: 0,
    },
    sku: {
        type: String,
        required: true,
    },
    created_at: {
        type: String,
        default: Date,
    },
    updated_at: {
        type: String,
        default: Date,
    },
});

module.exports = mongoose.model("Cart", Schema);
