const mongoose = require("mongoose");

const Schema = new mongoose.Schema({
    vendor_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: null,
    },
    product_name: {
        type: String,
        required: true,
    },
    category_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Category",
        required: true,
    },
    brand_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Brand",
        default: null,
    },
    unit_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Unit",
        default: null,
    },
    min_order_quantity: {
        type: Number,
        min: 1,
        required: true,
    },
    tags: {
        type: String,
        default: null,
    },
    slug: {
        type: String,
        unique: true,
        required: true,
    },
    status_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Status",
        required: true,
    },
    thumbnail: {
        type: String,
        required: true,
    },
    gallery_image: [
        {
            type: String,
            required: true,
        },
    ],
    video_url: {
        type: String,
        default: null,
    },
    unit_price: {
        type: Number,
        required: true,
    },
    special_discount_type: {
        type: String,
        default: null,
    },
    special_discount: {
        type: Number,
        default: 0,
    },
    special_discount_period: {
        type: String,
        default: null,
    },
    min_stock_quantity: {
        type: Number,
        default: 0,
    },
    stock_visibility: {
        type: String,
        default: null,
    },
    variant: {
        type: Boolean,
        default: false,
    },
    short_description: {
        type: String,
        default: null,
    },
    long_description: {
        type: String,
        default: null,
    },
    description_image: [
        {
            type: String,
        },
    ],
    pdf: {
        type: String,
    },
    is_featured: {
        type: Boolean,
        default: false,
    },
    todays_deal: {
        type: Boolean,
        default: false,
    },
    meta_title: {
        type: String,
        default: null,
    },
    meta_description: {
        type: String,
        default: null,
    },
    meta_keywords: {
        type: String,
        default: null,
    },
    meta_image: [
        {
            type: String,
        },
    ],
    attribute_sets: [
        {
            type: String,
            default: "",
        },
    ],
    selected_variants: [
        {
            type: Map,
            of: String,
            default: {},
        },
    ],
    selected_variants_ids: [
        {
            type: String,
            default: "",
        },
    ],
    created_at: {
        type: String,
        default: Date,
    },
    updated_at: {
        type: String,
        default: Date,
    },
});

module.exports = mongoose.model("Product", Schema);
