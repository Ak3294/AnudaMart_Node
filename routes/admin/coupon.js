const router = require("express").Router();
const { NotLoggedIn } = require("../../middlewares/Adminauth");
const CouponController = require("../../controllers/admin/couponController");

router.get("/list", NotLoggedIn, CouponController.list);
router.post("/add", NotLoggedIn, CouponController.add_coupon);
router.post("/edit", NotLoggedIn, CouponController.edit);
router.post("/delete/:id", NotLoggedIn, CouponController.delete);

module.exports = router;
