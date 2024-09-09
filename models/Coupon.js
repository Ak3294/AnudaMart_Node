const mongoose = require("mongoose");

const schema = new mongoose.Schema({
    create_by: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: null,
    },
    category_id: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Category",
            default: null,
        },
    ],
    type: {
        type: String,
    },
    discount: {
        type: Number,
    },
    date_range: {
        type: String,
    },
    message: {
        type: String,
    },
    product_id: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product",
            default: null,
        },
    ],
    status_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Status",
    },
    coupon_code: {
        type: String,
        unique: true,
        sparse: true,
    },
    is_applied: {
        type: Boolean,
        default: false,
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

module.exports = mongoose.model("Coupon", schema);
