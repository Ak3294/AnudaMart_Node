const website = require("./routes/website/website");
const webAuth = require("./routes/website/webAuth");
const vendor = require("./routes/website/vendor");
const payment = require("./routes/website/payment");
const cart = require("./routes/website/cart");
const order = require("./routes/website/order");
const contactus = require("./routes/website/contactus");

const WebsiteRoutes = (app) => {
    app.use("/api", website);
    app.use("/web/user", webAuth);
    app.use("/web/vendor", vendor);
    app.use("/api", payment);
    app.use("/api", cart);
    app.use("/api", order);
    app.use("/api", contactus);
};

module.exports = WebsiteRoutes;
