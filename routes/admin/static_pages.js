const router = require("express").Router();
const { NotLoggedIn } = require("../../middlewares/Adminauth");
const StaticPagesController = require("../../controllers/admin/staticPagesController");

router.get("/list", NotLoggedIn, StaticPagesController.list);
router.get("/add", NotLoggedIn, StaticPagesController.addGet);
router.post("/add", NotLoggedIn, StaticPagesController.create);
router.get("/edit/:id", NotLoggedIn, StaticPagesController.editGet);
router.post("/edit", NotLoggedIn, StaticPagesController.edit);
router.post("/delete/:id", NotLoggedIn, StaticPagesController.delete);

module.exports = router;
