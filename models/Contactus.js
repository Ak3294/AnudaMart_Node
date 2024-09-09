const mongoose = require("mongoose");

const schema = new mongoose.Schema({
    first_name: {
        type: String,
        min: 4,
        max: 30,
        required: true,
    },
    last_name: {
        type: String,
        min: 4,
        max: 30,
        required: true,
    },
    email: {
        type: String,
        max: 50,
        required: true,
    },
    phone: {
        type: String,
        max: 255,
    },
    country: {
        type: String,
        max: 50,
        required: true,
    },
    subject: {
        type: String,
        max: 50,
    },
    message: {
        type: String,
        max: 50,
    },
    terms_conditions: {
        type: Boolean,
        default: false,
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

module.exports = mongoose.model("Contactus", schema);
