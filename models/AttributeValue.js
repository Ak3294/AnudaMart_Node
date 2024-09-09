const mongoose = require("mongoose");

const Schema = new mongoose.Schema({
    attribute_sets_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "AttributeSets",
        required: true,
    },
    value: {
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

module.exports = mongoose.model("AttributeValue", Schema);
