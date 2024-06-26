const mongoose = require("mongoose");

const CategorySchema = new mongoose.Schema({
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
    },
    parent_id: {
        type: mongoose.Schema.Types.ObjectId,
        default: null,
    },
    status_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Status",
    },
    created_at: {
        type: String,
        default: Date,
    },
    updated_at: {
        type: String,
        default: Date.now,
    },
});

module.exports = mongoose.model("category", CategorySchema);
