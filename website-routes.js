const website = require("./routes/website/website");
const webAuth = require("./routes/website/webAuth");
const vendor = require("./routes/website/vendor");

const WebsiteRoutes = (app) => {
    app.use("/website", website);
    app.use("/web/user", webAuth);
    app.use("/web/vendor", vendor);
};

module.exports = WebsiteRoutes;
