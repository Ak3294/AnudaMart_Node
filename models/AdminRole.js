const mongoose = require("mongoose");

const schema = new mongoose.Schema({
    role_name: {
        type: String,
        require: true,
    },
    status_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Status",
    },
    created_at: {
        type: String,
        default: Date.now,
    },
    updated_at: {
        type: String,
        default: Date.now,
    },
});

module.exports = mongoose.model("AdminRole", schema);
