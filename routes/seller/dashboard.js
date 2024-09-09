const router = require("express").Router();
const DashboardController = require("../../controllers/seller/dashboardController");

router.get("/dashboard", DashboardController.dashboard);

module.exports = router;
