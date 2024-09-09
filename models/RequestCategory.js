const mongoose = require("mongoose");

const Schema = new mongoose.Schema({
    vendor_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    req_category_name: {
        type: String,
        required: true,
    },
    parent_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Category",
        default: null,
    },
    status: {
        type: String,
        enum: ["Pending", "Approved", "Rejected"],
        default: "Pending",
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

module.exports = mongoose.model("RequestCategory", Schema);
