const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    status_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Status",
        required: true,
    },
    order_no: {
        type: String,
    },
    order_date: {
        type: String,
        default: Date,
    },
    order_total_amount: {
        type: Number,
    },
    order_discount_amount: {
        type: Number,
    },
    coupon_code: {
        type: String,
    },
    order_subtotal_amount: {
        type: Number,
    },
    additional_info: {
        type: String,
    },
    payment_mode: {
        type: String,
    },
    payment_status: {
        type: String,
        default: "unpaid",
    },
    reason: {
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

module.exports = mongoose.model("Order", orderSchema);
