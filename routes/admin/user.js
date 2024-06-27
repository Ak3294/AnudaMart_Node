const router = require("express").Router();
const UserController = require("../../controllers/admin/userController");

router.get("/list", UserController.list);

module.exports = router;
