const mongoose = require("mongoose");

const sliderSchema = new mongoose.Schema({
    title: {
        type: String,
        max: 50,
        required: true,
    },
    description: {
        type: String,
        max: 100,
        required: true,
    },
    url: {
        type: String,
        max: 50,
        required: true,
    },
    status_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Status",
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

module.exports = mongoose.model("Slider", sliderSchema);
