const router = require("express").Router();
const { NotLoggedIn } = require("../../middlewares/Sellerauth");
const SupportController = require("../../controllers/seller/supportController");

router.get("/list", NotLoggedIn, SupportController.list);
router.post("/add", NotLoggedIn, SupportController.add);
router.post("/delete/:id", NotLoggedIn, SupportController.delete);

module.exports = router;
