const router = require("express").Router();
const websiteController = require("../../controllers/website/websiteController");
const { NotLoggedIn } = require("../../middlewares/WebAuth");

router.get("/category", NotLoggedIn, websiteController.category);
router.get("/category/:parent_id", NotLoggedIn, websiteController.category);

module.exports = router;
