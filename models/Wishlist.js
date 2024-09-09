const mongoose = require("mongoose");

const WishlistSchema = new mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: null,
    },
    product_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        default: null,
    },
    is_wishlist: {
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

module.exports = mongoose.model("Wishlist", WishlistSchema);
