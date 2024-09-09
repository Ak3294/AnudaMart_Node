const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema({
    order_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Order",
        required: true,
    },
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    orderId: {
        type: String,
    },
    payment_id: {
        type: String,
    },
    signature: {
        type: String,
    },
    amount: {
        type: Number,
        required: true,
    },
    currency: {
        type: String,
        required: true,
    },
    status_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Status",
        default: null,
    },
    payment_mode: {
        type: String,
    },
    created_at: {
        type: Date,
        default: Date,
    },
    updated_at: {
        type: Date,
        default: Date,
    },
});

module.exports = mongoose.model("Transaction", transactionSchema);
