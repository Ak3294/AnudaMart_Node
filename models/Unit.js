const mongoose = require("mongoose");

const Schema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    // code: {
    //     type: String,
    //     required: true,
    // },
    // code_name: {
    //     type: String,
    // },
    symbol: {
        type: String,
    },
    // symbol_international: {
    //     type: String,
    // },
    default: {
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

module.exports = mongoose.model("Unit", Schema);
