const mongoose = require("mongoose");

const BrandSchema = new mongoose.Schema({
    name: {
        type: String,
        max: 50,
        required: true,
    },
    status_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Status",
        default: null,
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

module.exports = mongoose.model("Brand", BrandSchema);
