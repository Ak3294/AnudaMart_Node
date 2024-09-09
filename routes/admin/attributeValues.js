const router = require("express").Router();
const { NotLoggedIn } = require("../../middlewares/Adminauth");
const AttributeValueController = require("../../controllers/admin/attributeValueController");

router.get("/list", NotLoggedIn, AttributeValueController.list);
router.post("/add", NotLoggedIn, AttributeValueController.add);
router.post("/edit", NotLoggedIn, AttributeValueController.edit);
router.post("/delete/:id", NotLoggedIn, AttributeValueController.delete);

module.exports = router;
