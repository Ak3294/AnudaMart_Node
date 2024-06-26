const mongoose = require("mongoose");

const schema = new mongoose.Schema({
    name: {
        type: String,
        max: 50,
        required: true,
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

module.exports = mongoose.model("City", schema);
