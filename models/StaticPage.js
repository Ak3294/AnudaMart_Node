const mongoose = require("mongoose");

const schema = new mongoose.Schema({
    title: {
        type: String,
        require: true,
    },
    description: {
        type: String,
        require: true,
    },
    meta_title: {
        type: String,
    },
    meta_description: {
        type: String,
    },
    meta_keywords: {
        type: String,
    },
    slug: {
        type: String,
    },
    status_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Status",
    },
    show_in: {
        type: String,
    },
    image: {
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

module.exports = mongoose.model("StaticPage", schema);
