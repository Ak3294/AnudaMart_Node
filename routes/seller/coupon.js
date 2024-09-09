const router = require("express").Router();
const { NotLoggedIn } = require("../../middlewares/Sellerauth");
const CouponController = require("../../controllers/seller/couponController");

router.get("/list", NotLoggedIn, CouponController.list);
router.post("/add", NotLoggedIn, CouponController.add_coupon);
router.post("/edit", NotLoggedIn, CouponController.edit);
router.post("/delete/:id", NotLoggedIn, CouponController.delete);

module.exports = router;
