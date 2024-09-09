const router = require("express").Router();
const { NotLoggedIn } = require("../../middlewares/Adminauth");
const ProductController = require("../../controllers/admin/productController");

router.get("/list", NotLoggedIn, ProductController.list);
router.get("/add", NotLoggedIn, ProductController.addGet);
router.post("/get-attribute-values", ProductController.getAttributeValues);
router.post("/get-variant", ProductController.getVariants);
router.post("/add", NotLoggedIn, ProductController.add_product);
router.get("/edit/:id", NotLoggedIn, ProductController.editGET);
router.post("/edit", NotLoggedIn, ProductController.editPOST);
router.post("/delete/:id?", NotLoggedIn, ProductController.delete);

module.exports = router;
