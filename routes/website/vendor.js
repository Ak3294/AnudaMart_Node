const router = require("express").Router();
const VendorController = require("../../controllers/website/vendorController");

router.post("/register", VendorController.register);
router.post("/update-profile", VendorController.update_profile);

module.exports = router;
