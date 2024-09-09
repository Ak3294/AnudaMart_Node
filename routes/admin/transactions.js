const router = require("express").Router();
const { NotLoggedIn } = require("../../middlewares/Adminauth");
const TransactionController = require("../../controllers/admin/transactionController");

router.get("/list", NotLoggedIn, TransactionController.list);

module.exports = router;
