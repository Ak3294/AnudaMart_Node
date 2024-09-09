const router = require("express").Router();
const { NotLoggedIn } = require("../../middlewares/Adminauth");
const StaffController = require("../../controllers/admin/staffController");

router.get("/list", NotLoggedIn, StaffController.list);
router.get("/add", NotLoggedIn, StaffController.addGET);
router.post("/add", NotLoggedIn, StaffController.create);
router.post("/edit", NotLoggedIn, StaffController.edit);
router.post("/delete/:id", NotLoggedIn, StaffController.delete);

module.exports = router;
