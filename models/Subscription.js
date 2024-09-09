const mongoose = require("mongoose");

const schema = new mongoose.Schema({
    email: {
        type: String,
        require: true,
        unique: true,
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

module.exports = mongoose.model("Subscription ", schema);
