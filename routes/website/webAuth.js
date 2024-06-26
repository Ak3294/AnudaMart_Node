const router = require("express").Router();
const webauthController = require("../../controllers/website/webauthController");

router.post("/register", webauthController.register);
router.post("/login", webauthController.loginPOST);
router.post("/change-password", webauthController.change_password);
router.post("/reset-password", webauthController.reset_password);
router.post("/profile", webauthController.user_profile);
router.post("/update-profile", webauthController.update_profile);
router.post("/logout", webauthController.logout);
router.post("/switch-account", webauthController.switch_account);

module.exports = router;
