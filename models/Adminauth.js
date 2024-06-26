const mongoose = require("mongoose");

const schema = new mongoose.Schema({
    username: {
        type: String,
        max: 50,
        required: true,
        default: null,
    },
    password: {
        type: String,
        min: 6,
        max: 255,
        required: true,
        default: null,
    },
    first_name: {
        type: String,
        default: null,
    },
    last_name: {
        type: String,
        default: null,
    },
    mobile_number: {
        type: String,
        unique: true,
        default: null,
    },
    email: {
        type: String,
        default: null,
    },
    dob: {
        type: String,
        default: null,
    },
    registration_date: {
        type: String,
        default: null,
    },
    address: {
        type: String,
        default: null,
    },
    city: {
        type: String,
        default: null,
    },
    state: {
        type: String,
        default: null,
    },
    pincode: {
        type: String,
        default: null,
    },
    sameaddress: {
        type: Boolean,
        default: true,
    },
    communication_address: {
        type: String,
        default: null,
    },
    communication_city: {
        type: String,
        default: null,
    },
    communication_state: {
        type: String,
        default: null,
    },
    nominee_name: {
        type: String,
        default: null,
    },
    nominee_mobile: {
        type: String,
        unique: true,
        default: null,
    },
    nominee_relation: {
        type: String,
        default: null,
    },
    aadhar_no: {
        type: String,
        unique: true,
        default: null,
    },
    gst_no: {
        type: String,
        unique: true,
        default: null,
    },
    pan_no: {
        type: String,
        unique: true,
        default: null,
    },
    business_profile: {
        type: String,
        default: null,
    },
    business_type: {
        type: String,
        default: null,
    },
    business_name: {
        type: String,
        default: null,
    },
    business_address: {
        type: String,
        default: null,
    },
    cover_image: {
        type: String,
    },
    profile_image: {
        type: String,
    },
    facebook: {
        type: String,
        default: null,
    },
    instagram: {
        type: String,
        default: null,
    },
    linkedin: {
        type: String,
        default: null,
    },
    twitter: {
        type: String,
        default: null,
    },
    status: {
        type: String,
        default: "active",
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

module.exports = mongoose.model("Adminauth", schema);
