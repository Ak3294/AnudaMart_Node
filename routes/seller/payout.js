const router = require("express").Router();
const { NotLoggedIn } = require("../../middlewares/Sellerauth");
const PayoutController = require("../../controllers/seller/payoutController");

router.get("/list", NotLoggedIn, PayoutController.list);
router.post("/request-add", NotLoggedIn, PayoutController.add);
router.post("/request-delete/:id", NotLoggedIn, PayoutController.delete);

module.exports = router;
