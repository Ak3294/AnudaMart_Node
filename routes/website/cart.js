const router = require("express").Router();
const CartController = require("../../controllers/website/cartController");
const { NotLoggedIn } = require("../../middlewares/WebAuth");

router.post("/product/add_to_cart", CartController.addToCart);
router.get("/get_cart", NotLoggedIn, CartController.getCart);
router.post("/product/remove_from_cart", NotLoggedIn, CartController.removeFromCart);

module.exports = router;
