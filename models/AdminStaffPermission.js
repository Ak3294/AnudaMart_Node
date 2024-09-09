const mongoose = require("mongoose");

const schema = new mongoose.Schema({
    admin_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Adminauth",
        required: true,
    },
    key: {
        type: String,
        required: true,
    },
    value: {
        type: String,
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

module.exports = mongoose.model("AdminStaffPermission", schema);
