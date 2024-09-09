const Cart = require("../../models/Cart");
const ProductStock = require("../../models/ProductStock");
const jwt = require("jsonwebtoken");

class CartController {
    static addToCart = async (req, res) => {
        try {
            if (!req.body.sku) {
                return res.status(404).send({
                    success: false,
                    status: 404,
                    message: "SKU is required!",
                });
            }

            var token = req.body.token;
            const payload = jwt.decode(token, process.env.TOKEN_SECRET);
            const userId = payload.id;

            // Find the ProductStock document by product_id
            const stockData = await ProductStock.findOne({
                product_id: req.body.product_id,
            });

            if (!stockData) {
                return res.status(404).send({
                    success: false,
                    status: 404,
                    message: "product_id not found in ProductStock",
                });
            }

            let skuArray = stockData.sku;
            let skuIndex = 0;

            skuIndex = skuArray.findIndex((sku) => sku === req.body.sku);

            if (skuIndex === -1) {
                return res.status(404).send({
                    success: false,
                    status: 404,
                    message: "SKU is not Present in Product Stock",
                });
            }
            const insertitem = new Cart({
                product_id: req.body.product_id,
                quantity: req.body.quantity,
                user_id: userId,
                sku: req.body.sku,
                product_stock_id: stockData._id, // Store the stock document's _id
            });
            if (req.body.quantity > stockData.current_stock[skuIndex]) {
                return res.status(400).send({
                    success: false,
                    status: 400,
                    message: "Product is Out of Stock!",
                });
            }

            // CartData
            const cartData = await Cart.find({
                user_id: userId,
                product_id: req.body.product_id,
                sku: req.body.sku,
            });
            if (cartData.length == 0) {
                await insertitem.save();
                return res.send({
                    success: true,
                    status: 200,
                    message: "Item is add to Cart Successfully!",
                });
            }

            // If user is already present in the Cart then Update the quantity of the product in the Cart

            if (cartData) {
                const updateitem = await Cart.findOneAndUpdate(
                    { sku: req.body.sku },
                    {
                        $set: {
                            quantity: req.body.quantity,
                        },
                    },
                    { new: true }
                );

                if (
                    cartData.quantity + req.body.quantity >
                    stockData.current_stock[skuIndex]
                ) {
                    return res.status(400).send({
                        success: false,
                        status: 400,
                        message: "Product is Out of Stock!",
                    });
                }
                await updateitem.save();
                return res.status(200).send({
                    success: true,
                    status: 200,
                    message: "Cart is Update!",
                });
            }
        } catch (error) {
            console.error(error);
            return res.status(500).send({
                message: "Error add to cart: " + error.message,
            });
        }
    };

    static getCart = async (req, res) => {
        try {
            const cart = await Cart.find().populate(
                "product_stock_id product_id user_id"
            );
            return res.send({
                success: true,
                status: 200,
                message: "Cart fetched successfully",
                data: cart,
            });
        } catch (error) {
            console.error(error);
            return res.status(500).send({
                message: "Error fetching cart: " + error.message,
            });
        }
    };

    static removeFromCart = async (req, res) => {
        try {
            const { token, sku } = req.body;
            if (!token) {
                return res.status(400).send({
                    success: false,
                    message: "Token is required!",
                });
            }
            const payload = jwt.decode(token, process.env.TOKEN_SECRET);
            const userId = payload.id;

            let result;

            if (sku) {
                result = await Cart.deleteOne({ user_id: userId, sku: sku });

                if (result.deletedCount === 0) {
                    return res.status(404).send({
                        success: false,
                        message: `No item found in the cart with SKU: ${sku} to remove.`,
                    });
                }

                return res.status(200).send({
                    success: true,
                    message: `Item with SKU: ${sku} removed from cart successfully!`,
                });
            } else {
                result = await Cart.deleteMany({ user_id: userId });

                if (result.deletedCount === 0) {
                    return res.status(404).send({
                        success: false,
                        message: "No items found in the cart to remove.",
                    });
                }

                return res.status(200).send({
                    success: true,
                    message: "All items removed from cart successfully!",
                });
            }
        } catch (error) {
            console.error(error);
            return res.status(500).send({
                message: "Error removing items from cart: " + error.message,
            });
        }
    };
}

module.exports = CartController;
