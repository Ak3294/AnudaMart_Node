const mongoose = require("mongoose");

const schema = new mongoose.Schema({
    address: {
        type: String,
        required: true,
    },
    phone: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    toll_number: {
        type: String,
        required: true,
    },
    logo: {
        type: String,
        required: true,
    },
    copyright: {
        type: String,
        required: true,
    },
    twitter: {
        type: String,
        required: true,
    },
    facebook: {
        type: String,
        required: true,
    },
    instagram: {
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

module.exports = mongoose.model("WebSetting", schema);
