const mongoose = require("mongoose");

const schema = new mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    aadhar_front_photo: {
        type: String,
    },
    aadhar_back_photo: {
        type: String,
    },
    aadhar_no: {
        type: String,
    },
    pan_front_photo: {
        type: String,
    },
    pan_no: {
        type: String,
    },
    gst_no: {
        type: String,
    },
    signature: {
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
        default: Date.now,
    },
    updated_at: {
        type: String,
        default: Date.now,
    },
});

module.exports = mongoose.model("Vendor", schema);
