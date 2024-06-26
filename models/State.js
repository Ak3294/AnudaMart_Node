const mongoose = require("mongoose");

const schema = new mongoose.Schema({
    name: {
        type: String,
        max: 50,
        required: true,
    },
    country_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Country",
        required: true,
    },
    city_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "City",
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

module.exports = mongoose.model("State", schema);
