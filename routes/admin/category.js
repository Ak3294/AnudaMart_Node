const router = require("express").Router();
const { NotLoggedIn } = require("../../middlewares/Adminauth");
const CategoryController = require("../../controllers/admin/categoryController");

router.get("/list", NotLoggedIn, CategoryController.list);
router.post("/add", NotLoggedIn, CategoryController.add);
router.post("/edit", NotLoggedIn, CategoryController.edit);
router.post("/delete/:id", NotLoggedIn, CategoryController.delete);

module.exports = router;
