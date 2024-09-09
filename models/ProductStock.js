const mongoose = require("mongoose");

const ProductStockSchema = new mongoose.Schema({
    attribute_value_id: [
        {
            type: String,
            default: null,
        },
    ],
    name: [
        {
            type: String,
            default: null,
        },
    ],
    product_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true,
    },
    sku: [
        {
            type: String,
            unique: true,
            default: null,
        },
    ],
    current_stock: [
        {
            type: Number,
            default: 0,
        },
    ],
    price: [
        {
            type: Number,
            default: 0,
        },
    ],
    image: [
        {
            type: String,
        },
    ],
    created_at: {
        type: String,
        default: Date,
    },
    updated_at: {
        type: String,
        default: Date,
    },
});

module.exports = mongoose.model("ProductStock", ProductStockSchema);
