const router = require("express").Router();
const { NotLoggedIn } = require("../../middlewares/Sellerauth");
const CategoryController = require("../../controllers/seller/categoryController");

router.get("/list", NotLoggedIn, CategoryController.list);
router.post("/request-add", NotLoggedIn, CategoryController.add);
router.post("/request-delete/:id", NotLoggedIn, CategoryController.delete);

module.exports = router;
