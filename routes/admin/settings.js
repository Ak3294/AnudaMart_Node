const router = require("express").Router();
const { NotLoggedIn } = require("../../middlewares/Adminauth");
const SettingsController = require("../../controllers/admin/settingsController");

router.get("/banner/list", NotLoggedIn, SettingsController.list);
router.post("/banner/add", NotLoggedIn, SettingsController.addBanner);
router.get("/settings_view", NotLoggedIn, SettingsController.settings_view);
router.post("/web-settings", NotLoggedIn, SettingsController.webSettings);
router.get(
    "/smtp_config_view",
    NotLoggedIn,
    SettingsController.smtp_config_view
);
router.post(
    "/smtp_config_add",
    NotLoggedIn,
    SettingsController.smtp_config_add
);
router.get("/razorpay_config", NotLoggedIn, SettingsController.razorpay_config);
router.post(
    "/razorpay_config_add",
    NotLoggedIn,
    SettingsController.razorpay_config_add
);

module.exports = router;
