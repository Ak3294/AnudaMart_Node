const mongoose = require("mongoose");

const schema = new mongoose.Schema({
    amount: {
        type: Number,
        required: true,
    },
    department: {
        type: String,
    },
    account_holder_name: {
        type: String,
    },
    ifsc_code: {
        type: String,
    },
    bank_name: {
        type: String,
    },
    account_no: {
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

module.exports = mongoose.model("PayoutReport", schema);
