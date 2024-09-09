const router = require("express").Router();
const { NotLoggedIn } = require("../../middlewares/Adminauth");
const BrandController = require("../../controllers/admin/brandController");

router.get("/list", NotLoggedIn, BrandController.list);
router.post("/add", NotLoggedIn, BrandController.add);
router.post("/edit/:id", NotLoggedIn, BrandController.edit);
router.post("/delete/:id", NotLoggedIn, BrandController.delete);

module.exports = router;
