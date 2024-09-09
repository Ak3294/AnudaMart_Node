const router = require("express").Router();
const { NotLoggedIn } = require("../../middlewares/Adminauth");
const UnitController = require("../../controllers/admin/unitController");

router.get("/list", NotLoggedIn, UnitController.list);
router.post("/add", NotLoggedIn, UnitController.add);
router.post("/edit", NotLoggedIn, UnitController.edit);
router.post("/delete/:id", NotLoggedIn, UnitController.delete);

module.exports = router;
