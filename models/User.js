const mongoose = require("mongoose");

const schema = new mongoose.Schema({
    user_type: {
        type: String,
        enum: ["u", "v"],
        required: true,
    },
    switch_account: {
        type: String,
        enum: ["u", "v"],
    },
    name: {
        type: String,
        min: 4,
        max: 30,
    },
    first_name: {
        type: String,
        min: 4,
        max: 30,
    },
    last_name: {
        type: String,
        min: 4,
        max: 30,
    },
    email: {
        type: String,
        max: 50,
        required: true,
    },
    // phone: {
    //     type: String,
    //     // unique: true,
    //     // max: 255,
    //     // required: true,
    // },
    password: {
        type: String,
        min: 6,
        max: 255,
        required: true,
    },
    dob: {
        type: String,
        max: 255,
    },
    address: {
        type: String,
        max: 255,
        // required: true,
    },
    address2: {
        type: String,
        max: 255,
    },
    city_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "City",
    },
    state_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "State",
    },
    country_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Country",
    },
    pincode: {
        type: String,
    },
    image: {
        type: String,
        default: Date.now,
    },
    additional_info: {
        type: String,
        max: 255,
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

module.exports = mongoose.model("User", schema);
