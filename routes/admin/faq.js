const router = require("express").Router();
const { NotLoggedIn } = require("../../middlewares/Adminauth");
const FaqController = require("../../controllers/admin/faqController");

router.get("/list", NotLoggedIn, FaqController.list);
router.post("/add", NotLoggedIn, FaqController.add);
router.post("/delete/:id", NotLoggedIn, FaqController.delete);

module.exports = router;
