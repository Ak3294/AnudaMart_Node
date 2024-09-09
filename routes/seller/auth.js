const router = require("express").Router();
const { NotLoggedIn } = require("../../middlewares/Sellerauth");
const AuthController = require("../../controllers/seller/authController");

router.get("/login", AuthController.loginGET);
router.post("/login", AuthController.loginPOST);
router.get("/changepassword", NotLoggedIn, AuthController.changepasswordGET);
router.post("/changepassword", NotLoggedIn, AuthController.changepasswordPOST);
router.get("/profile", NotLoggedIn, AuthController.profileGET);
router.post("/profile-update", NotLoggedIn, AuthController.profileUpdate);
router.post("/logout", NotLoggedIn, AuthController.logout);

module.exports = router;
