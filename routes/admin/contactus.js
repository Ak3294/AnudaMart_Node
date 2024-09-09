const router = require("express").Router();
const { NotLoggedIn } = require("../../middlewares/Adminauth");
const ContactusController = require("../../controllers/admin/contactusController");

router.get("/list", NotLoggedIn, ContactusController.list);

module.exports = router;
