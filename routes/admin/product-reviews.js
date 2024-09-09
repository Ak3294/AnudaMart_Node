const router = require("express").Router();
const { NotLoggedIn } = require("../../middlewares/Adminauth");
const ProductReviewController = require("../../controllers/admin/productReviewController");

router.get("/list", NotLoggedIn, ProductReviewController.list);
router.post("/show", NotLoggedIn, ProductReviewController.showRatingsStatus);
router.post("/hide", NotLoggedIn, ProductReviewController.hideRatingsStatus);
router.post("/filter", NotLoggedIn, ProductReviewController.filterRatings);

module.exports = router;
