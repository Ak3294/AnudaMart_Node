const mongoose = require("mongoose");

const Schema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    category_id: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Category",
            default: null,
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

module.exports = mongoose.model("AttributeSets", Schema);
