const mongoose = require("mongoose");

const schema = new mongoose.Schema({
    type: {
        type: String,
        enum: ["a", "s"],
        required: true,
    },
    username: {
        type: String,
        max: 50,
        default: null,
    },
    password: {
        type: String,
        min: 6,
        max: 255,
        required: true,
        default: null,
    },
    first_name: {
        type: String,
    },
    last_name: {
        type: String,
    },
    email: {
        type: String,
    },
    phone: {
        type: String,
        unique: true,
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

module.exports = mongoose.model("Adminauth", schema);
