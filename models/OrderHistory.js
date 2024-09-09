const mongoose = require("mongoose");

const orderHistorySchema = new mongoose.Schema({
    order_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Order",
    },
    product_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true,
    },
    product_name: {
        type: String,
        required: true,
    },
    sku: {
        type: String,
        default: null,
    },
    attribute_value_id: [
        {
            type: String,
            default: null,
        },
    ],
    variants: [
        {
            type: String,
            default: null,
        },
    ],
    unit_price: {
        type: Number,
        required: true,
    },
    quantity: {
        type: String,
        required: true,
    },
    special_discount: {
        type: Number,
        default: null,
    },
    sub_total: {
        type: Number,
        required: true,
    },
    orderId: {
        type: String,
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

module.exports = mongoose.model("OrderHistory", orderHistorySchema);
