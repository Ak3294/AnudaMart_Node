const router = require("express").Router();
const { NotLoggedIn } = require("../../middlewares/Adminauth");
const UserController = require("../../controllers/admin/userController");

router.get("/list", NotLoggedIn, UserController.list);
router.post("/add", NotLoggedIn, UserController.create);
router.post("/edit", NotLoggedIn, UserController.edit);
router.get("/order-view/:id", NotLoggedIn, UserController.view);
router.post("/delete/:id", NotLoggedIn, UserController.delete);

module.exports = router;
