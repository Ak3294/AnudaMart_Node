const dashboardR = require("./routes/seller/dashboard");
const authR = require("./routes/seller/auth");
const product = require("./routes/seller/product");
const category = require("./routes/seller/category");
const orders = require("./routes/seller/orders");
const reports = require("./routes/seller/reports");
const coupon = require("./routes/seller/coupon");
const payout = require("./routes/seller/payout");
const shopSettings = require("./routes/seller/shop_settings");
const support = require("./routes/seller/support");

const SellerRoutes = (app) => {
    app.use("/seller", authR);
    app.use("/seller", dashboardR);
    app.use("/seller/product", product);
    app.use("/seller/category", category);
    app.use("/seller/order", orders);
    app.use("/seller/reports", reports);
    app.use("/seller/coupon", coupon);
    app.use("/seller/payout", payout);
    app.use("/seller/shop-settings", shopSettings);
    app.use("/seller/support", support);
};

module.exports = SellerRoutes;
