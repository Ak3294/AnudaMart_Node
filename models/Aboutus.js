const mongoose = require("mongoose");

const schema = new mongoose.Schema({
    content: {
        type: String,
        require: true,
    },
    created_at: {
        type: String,
        default: Date.now,
    },
    updated_at: {
        type: String,
        default: Date.now,
    },
});

module.exports = mongoose.model("Aboutus", schema);
