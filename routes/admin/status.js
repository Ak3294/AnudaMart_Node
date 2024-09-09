const router = require("express").Router();
const { NotLoggedIn } = require("../../middlewares/Adminauth");
const StatusController = require("../../controllers/admin/statusController");

router.get("/list", NotLoggedIn, StatusController.list);
router.post("/add", NotLoggedIn, StatusController.add);
router.post("/edit", NotLoggedIn, StatusController.edit);
router.post("/delete/:id", NotLoggedIn, StatusController.delete);

module.exports = router;
