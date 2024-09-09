const mongoose = require("mongoose");

const schema = new mongoose.Schema({
    home_banner_top: {
        image: { type: String, required: true },
        url: { type: String, required: true },
        title: { type: String, required: true },
        description: { type: String, required: true },
    },
    home_banner_2: {
        image: { type: String, required: true },
        url: { type: String, required: true },
        title: { type: String, required: true },
        description: { type: String, required: true },
    },
    home_banner_3: {
        image: { type: String, required: true },
        url: { type: String, required: true },
        title: { type: String, required: true },
        description: { type: String, required: true },
    },
    home_banner_4: {
        image: { type: String, required: true },
        url: { type: String, required: true },
        title: { type: String, required: true },
        description: { type: String, required: true },
    },
    subscription_banner: {
        image: { type: String, required: true },
        url: { type: String, required: true },
        title: { type: String, required: true },
        description: { type: String, required: true },
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

module.exports = mongoose.model("Banner", schema);
