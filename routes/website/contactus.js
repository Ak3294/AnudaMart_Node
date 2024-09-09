const router = require("express").Router();
const ContactusController = require("../../controllers/website/contactusController");

router.post("/contactus", ContactusController.contactus);
router.get("/get_contactus", ContactusController.get_contactus);

module.exports = router;
