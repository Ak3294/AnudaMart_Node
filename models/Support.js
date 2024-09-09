const mongoose = require("mongoose");

const schema = new mongoose.Schema({
    subject: {
        type: String,
        max: 50,
        required: true,
    },
    priority: {
        type: String,
    },
    description: {
        type: String,
    },
    gallery_images: [
        {
            type: String,
        },
    ],
    created_at: {
        type: String,
        default: Date,
    },
    updated_at: {
        type: String,
        default: Date,
    },
});

module.exports = mongoose.model("Support", schema);
