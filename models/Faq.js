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
    created_at: {
        type: String,
        default: Date,
    },
    updated_at: {
        type: String,
        default: Date,
    },
});

module.exports = mongoose.model("Faq", schema);
