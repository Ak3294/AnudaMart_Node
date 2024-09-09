const mongoose = require("mongoose");

const Schema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    icon: {
        type: String,
        // required: true
    },
    slug: {
        type: String,
        required: true,
        unique: true,
    },
    parent_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Category",
        default: null,
    },
    meta_title: {
        type: String,
    },
    meta_description: {
        type: String,
    },
    is_featured: {
        type: Boolean,
        default: false,
    },
    // commission_type: {
    //     type: String,
    //     default: null,
    // },
    commission: {
        type: Number,
        default: 0,
    },
    description: {
        type: String,
        default: null,
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

module.exports = mongoose.model("Category", Schema);
