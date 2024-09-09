const mongoose = require("mongoose");

const Schema = new mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },
    first_name: {
        type: String,
    },
    last_name: {
        type: String,
    },
    email: {
        type: String,
        max: 50,
    },
    phone: {
        type: String,
        max: 255,
    },
    address: {
        type: String,
        max: 255,
    },
    address2: {
        type: String,
        max: 255,
    },
    city: {
        type: String,
    },
    state: {
        type: String,
    },
    post_code: {
        type: String,
    },
    company_name: {
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

module.exports = mongoose.model("UserBillingAddress", Schema);
