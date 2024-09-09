const Razorpay = require("razorpay");
const RazorpayConfig = require("../models/RazorpayConfig");
require("dotenv").config();

async function initializeRazorpay() {
    try {
        let config = await RazorpayConfig.findOne().sort({ created_at: -1 });

        if (!config || !config.key_id || !config.key_secret) {
            return null;
        }

        // Razorpay instance initialization
        const razorpay = new Razorpay({
            key_id: config.key_id,
            key_secret: config.key_secret,
        });

        return razorpay;
    } catch (error) {
        console.error("Error initializing Razorpay:", error.message);
        throw new Error("Error initializing Razorpay: " + error.message);
    }
}

module.exports = initializeRazorpay;
