const router = require("express").Router();
const { NotLoggedIn } = require("../../middlewares/Adminauth");
const SliderController = require("../../controllers/admin/sliderController");

router.get("/list", NotLoggedIn, SliderController.list);
router.post("/add", NotLoggedIn, SliderController.add);
router.post("/edit", NotLoggedIn, SliderController.edit);
router.post("/delete/:id", NotLoggedIn, SliderController.delete);

module.exports = router;
