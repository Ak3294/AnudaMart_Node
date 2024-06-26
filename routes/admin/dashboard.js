const router = require("express").Router();
const { NotLoggedIn } = require("../../middlewares/Adminauth");
const DashboardController = require("../../controllers/admin/dashboardController");

router.get("/dashboard", NotLoggedIn, DashboardController.dashboard);

module.exports = router;
