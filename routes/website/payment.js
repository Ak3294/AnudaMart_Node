const router = require("express").Router();
const { NotLoggedIn } = require("../../middlewares/WebAuth");
const PaymentController = require("../../controllers/website/paymentController");

router.post("/create-order", NotLoggedIn, PaymentController.createOrder);
router.post("/payment-checkout", NotLoggedIn, PaymentController.checkout);

module.exports = router;
