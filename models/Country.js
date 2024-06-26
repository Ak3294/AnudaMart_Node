const mongoose = require("mongoose");

const schema = new mongoose.Schema({
    name: {
        type: String,
        max: 50,
        required: true,
    },
    code: {
        type: String,
        required: true,
        unique: true,
    },
    state_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "State",
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

module.exports = mongoose.model("Country", schema);
