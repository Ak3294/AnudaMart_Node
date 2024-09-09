const mongoose = require("mongoose");

const smtpConfigSchema = new mongoose.Schema({
    service: {
        type: String,
        required: true,
    },
    host: {
        type: String,
        required: true,
    },
    port: {
        type: Number,
        required: true,
    },
    mail_address: {
        type: String,
        required: true,
    },
    name: {
        type: String,
        required: true,
    },
    username: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true,
    },
    secure: {
        type: Boolean,
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

module.exports = mongoose.model("SmtpConfig", smtpConfigSchema);
