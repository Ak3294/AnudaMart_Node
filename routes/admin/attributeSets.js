const router = require("express").Router();
const { NotLoggedIn } = require("../../middlewares/Adminauth");
const AttributeSetsController = require("../../controllers/admin/attributeSetsController");

router.get("/list", NotLoggedIn, AttributeSetsController.list);
router.post("/add", NotLoggedIn, AttributeSetsController.add);
router.post("/edit", NotLoggedIn, AttributeSetsController.edit);
router.post("/delete/:id", NotLoggedIn, AttributeSetsController.delete);

module.exports = router;
