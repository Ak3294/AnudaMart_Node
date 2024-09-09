const router = require("express").Router();
const { NotLoggedIn } = require("../../middlewares/Adminauth");
const VendorController = require("../../controllers/admin/vendorController");

router.get("/list", NotLoggedIn, VendorController.list);
router.post("/add", NotLoggedIn, VendorController.add);
router.get("/edit/:id", NotLoggedIn, VendorController.edit);
router.post("/update", NotLoggedIn, VendorController.update);
router.post("/status_change", NotLoggedIn, VendorController.status_change);
router.post("/status_ban", NotLoggedIn, VendorController.status_ban);
router.get("/delete/:id", NotLoggedIn, VendorController.delete);

module.exports = router;
