// routes/admin/brand.js

const router = require("express").Router();
const BrandController = require("../../controllers/admin/brandControllers");

router.get("/list", BrandController.list);
router.post("/add", BrandController.create);

module.exports = router;

