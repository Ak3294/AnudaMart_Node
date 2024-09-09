const router = require("express").Router();
const { NotLoggedIn } = require("../../middlewares/Sellerauth");
const OrderController = require("../../controllers/seller/orderController");

router.get("/list", NotLoggedIn, OrderController.list);
router.get("/details/:id", NotLoggedIn, OrderController.order_overview);

module.exports = router;
