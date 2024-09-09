const router = require("express").Router();
const ReportController = require("../../controllers/seller/reportsController");

router.get("/product-sale", ReportController.product_sale);
router.get("/product-stock", ReportController.product_stock);
router.get("/product-wishlist", ReportController.product_wishlist);
router.get("/commission-history", ReportController.commission_history);

module.exports = router;
