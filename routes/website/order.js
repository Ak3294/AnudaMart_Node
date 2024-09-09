const router = require("express").Router();
const { NotLoggedIn } = require("../../middlewares/WebAuth");
const OrderController = require("../../controllers/website/orderController");

router.get("/get_orders", OrderController.getOrders);
router.get("/get_order-details", OrderController.getOrderDetails);
router.post("/get_orderItems", OrderController.orderItems);
router.get("/get_transactions", OrderController.get_transactions);
router.post("/get_userBillingAddress", OrderController.userBillingAddress);
router.post(
    "/add-userBillingAddress",
    NotLoggedIn,
    OrderController.add_userBillingAddress
);
router.post(
    "/update-userBillingAddress",
    NotLoggedIn,
    OrderController.update_userBillingAddress
);
router.post(
    "/delete-userBillingAddress",
    NotLoggedIn,
    OrderController.delete_userBillingAddress
);

module.exports = router;
