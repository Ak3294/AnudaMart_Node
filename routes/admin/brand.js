// routes/admin/brand.js

const router = require("express").Router();
const BrandController = require("../../controllers/admin/brandControllers");

router.get("/list", BrandController.list);
router.post("/add", BrandController.create);
// Correct route with parameter
router.post("/edit/:id", BrandController.update);
router.delete("/delete/:id", BrandController.delete);

module.exports = router;
