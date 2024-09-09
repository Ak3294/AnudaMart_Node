const router = require("express").Router();
const { NotLoggedIn } = require("../../middlewares/WebAuth");
const webauthController = require("../../controllers/website/webauthController");

router.post("/register", webauthController.register);
router.post("/login", webauthController.loginPOST);
router.post("/change-password", webauthController.change_password);
router.post("/forgot-password", webauthController.forgot_password);
router.post("/reset-password", webauthController.reset_password);
router.post("/profile", webauthController.user_profile);
router.post("/update-profile", webauthController.update_profile);
router.post("/logout", webauthController.logout);
router.post("/switch-account", webauthController.switch_account);

router.post("/verify-coupon", webauthController.coupon_verify);
router.post("/product-rating", NotLoggedIn, webauthController.product_rating);
router.get("/get_product_ratings", webauthController.get_product_ratings);
router.post(
    "/product-wishlist",
    NotLoggedIn,
    webauthController.product_wishlist
);
router.post("/get_wishlist", webauthController.get_wishlist);
router.post("/delete-wishlist", NotLoggedIn, webauthController.delete_wishlist);
router.post("/subscription", NotLoggedIn, webauthController.subscription);

module.exports = router;
