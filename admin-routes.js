const mainR = require("./routes/admin/main");
const dashboardR = require("./routes/admin/dashboard");
const authR = require("./routes/admin/auth");
const category = require("./routes/admin/category");
const brandR = require('./routes/admin/brand');
const userR = require("./routes/admin/user");

const AdminRoutes = (app) => {
    app.use("/", mainR);
    app.use("/admin", dashboardR);
    app.use("/admin", authR);
    app.use("/admin/category", category);
    app.use("/admin/brand", brandR);
    app.use("/admin/user",userR);
};

module.exports = AdminRoutes;
