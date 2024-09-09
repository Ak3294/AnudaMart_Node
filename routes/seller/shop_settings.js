const router = require("express").Router();
const ShopSettingsController = require("../../controllers/seller/shopSettingsControlller");

router.get("/profile",ShopSettingsController.profile);


module.exports = router;