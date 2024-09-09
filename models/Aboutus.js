const mongoose = require("mongoose");

const schema = new mongoose.Schema({
    content: {
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

module.exports = mongoose.model("Aboutus", schema);
