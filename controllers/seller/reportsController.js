const Wishlist = require("../../models/Wishlist");
const Order = require("../../models/Order");
const OrderHistory = require("../../models/OrderHistory");
const Product = require("../../models/Product");
const ProductStock = require("../../models/ProductStock");

class ReportsController {
    static product_sale = async (req, res) => {
        try {
            const orders = await Order.find({
                user_id: req.session.seller._id,
            }).populate("user_id status_id");

            const orderhistory = await OrderHistory.find({
                order_id: { $in: orders.map((order) => order._id) },
            }).populate({
                path: "product_id",
                populate: {
                    path: "category_id",
                    model: "Category",
                    select: "name",
                },
            });
            const page = parseInt(req.query.page) || 1; // Current page number, default to 1
            const pageSize = parseInt(req.query.pageSize) || 10; // Items per page, default to 10

            const totalItems = orderhistory.length;
            return res.render("seller/product-sale", {
                orders,
                orderhistory,
                currentPage: page,
                pageSize,
                totalItems,
            });
        } catch (error) {
            console.error("Error fetching Product Sale List:", error);
            return res.status(500).send({
                message: "Error fetching Product Sale List: " + error.message,
            });
        }
    };

    static product_stock = async (req, res) => {
        try {
            const products = await Product.find({
                vendor_id: req.session.seller._id,
            })
                .populate("category_id")
                .sort({ created_at: -1 });

            // Calculate stock for each product
            const productsWithStock = await Promise.all(
                products.map(async (product) => {
                    let remainingStock = 0;
                    if (product.variant) {
                        const productStocks = await ProductStock.find({
                            product_id: product._id,
                        });
                        remainingStock = productStocks.reduce(
                            (sum, stock) =>
                                sum +
                                stock.current_stock.reduce((a, b) => a + b, 0),
                            0
                        );
                    } else {
                        remainingStock = await ProductStock.findOne({
                            product_id: product._id,
                        });
                        remainingStock = remainingStock
                            ? remainingStock.current_stock.reduce(
                                  (a, b) => a + b,
                                  0
                              )
                            : 0;
                    }
                    return {
                        ...product._doc,
                        remainingStock,
                    };
                })
            );

            const page = parseInt(req.query.page) || 1; // Current page number, default to 1
            const pageSize = parseInt(req.query.pageSize) || 10; // Items per page, default to 10

            const totalItems = productsWithStock.length;
            return res.render("seller/product-stock", {
                products: productsWithStock,
                currentPage: page,
                pageSize,
                totalItems,
            });
        } catch (error) {
            console.error("Error fetching Product Stock:", error);
            return res.status(500).send({
                message: "Error fetching Product Stock: " + error.message,
            });
        }
    };

    static product_wishlist = async (req, res) => {
        try {
            const seller_id = req.session.seller._id;
            const wishlist = await Wishlist.find({ user_id: seller_id })
                .populate({
                    path: "product_id",
                    populate: {
                        path: "category_id",
                        model: "Category",
                        select: "name",
                    },
                })
                .exec();

            const page = parseInt(req.query.page) || 1; // Current page number, default to 1
            const pageSize = parseInt(req.query.pageSize) || 10; // Items per page, default to 10

            const totalItems = wishlist.length;
            return res.render("seller/product-wishlist", {
                wishlist,
                currentPage: page,
                pageSize,
                totalItems,
            });
        } catch (error) {
            console.error("Error fetching Product Wishlist:", error);
            return res.status(500).send({
                message: "Error fetching Product Wishlist: " + error.message,
            });
        }
    };

    static commission_history = async (req, res) => {
        return res.render("seller/commission-history");
    };
}

module.exports = ReportsController;
