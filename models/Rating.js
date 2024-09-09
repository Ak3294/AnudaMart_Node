const mongoose = require("mongoose");

const Schema = new mongoose.Schema({
    product_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true,
    },
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: null,
    },
    rating: {
        type: Number,
        max: 5,
    },
    comment: {
        type: String,
    },
    image: {
        type: String,
    },
    status_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Status",
        default: null,
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

module.exports = mongoose.model("Rating", Schema);
