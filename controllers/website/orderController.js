const Order = require("../../models/Order");
const Transaction = require("../../models/Transaction");
const BillingAddress = require("../../models/BillingAddress");
const UserBillingAddress = require("../../models/UserBillingAddress");
const OrderHistory = require("../../models/OrderHistory");
const Rating = require("../../models/Rating");
require("dotenv").config();
const baseURL = process.env.BaseURL;
const fs = require("fs");
const path = require("path");
const jwt = require("jsonwebtoken");
const defaultImage = baseURL + "/assets/images/default/mart-demo-img.jpg";

class OrderController {
    static getOrders = async (req, res) => {
        try {
            var token = req.body.token;
            const payload = jwt.decode(token, process.env.TOKEN_SECRET);
            const userId = payload.id;

            let orders = await Order.find({ user_id: userId });
            return res.send({
                success: true,
                status: 200,
                message: "Order fetched successfully",
                data: orders,
            });
        } catch (error) {
            console.error("Error fetching data:", error);
            res.send({
                success: false,
                status: 500,
                message: "Error fetching data" + error.message,
            });
        }
    };

    static getOrderDetails = async (req, res) => {
        try {
            const order_id = req.body.order_id;
            let finalArray = {};

            if (order_id) {
                const transactions = await Transaction.find({
                    order_id: order_id,
                });

                const billingAddresses = await BillingAddress.find({
                    order_id: order_id,
                }).exec();

                const orderHistories = await OrderHistory.find({
                    order_id: order_id,
                }).exec();

                finalArray = {
                    transactions,
                    billingAddresses,
                    orderHistories,
                };
            }
            return res.send({
                success: true,
                status: 200,
                message: "Order Details fetched successfully",
                data: finalArray,
            });
        } catch (error) {
            console.error("Error fetching data:", error);
            res.send({
                success: false,
                status: 500,
                message: "Error fetching data" + error.message,
            });
        }
    };

    static orderItems = async (req, res) => {
        try {
            const { token } = req.body;
            const payload = jwt.decode(token, process.env.TOKEN_SECRET);
            const userId = payload.id;

            if (!userId) {
                return res.status(401).send({
                    success: false,
                    message: "Unauthorized access",
                });
            }

            const mediaUrl = baseURL + "/dist/product/";

            const orders = await Order.find({ user_id: userId });
            const orderIds = orders.map((order) => order._id);

            const orderHistories = await OrderHistory.find({
                order_id: { $in: orderIds },
            })
                .populate({
                    path: "product_id",
                    select: "thumbnail slug",
                })
                .lean();

            // Prepare response data
            const ordersItems = await Promise.all(
                orderHistories.map(async (order) => {
                    let thumbnail = order.product_id
                        ? order.product_id.thumbnail
                        : "";

                    // Check if thumbnail exists or set default image
                    if (!thumbnail || thumbnail.trim() === "") {
                        thumbnail = defaultImage;
                    } else {
                        const thumbnailPath = path.join(
                            __dirname,
                            "../../public/dist/product/",
                            thumbnail.trim()
                        );
                        try {
                            fs.accessSync(thumbnailPath, fs.constants.F_OK);
                            thumbnail = mediaUrl + thumbnail;
                        } catch (err) {
                            thumbnail = defaultImage;
                        }
                    }

                    // Check if the user has given a rating for this product
                    const ratingExists = await Rating.findOne({
                        product_id: order.product_id
                            ? order.product_id._id
                            : null,
                        user_id: userId,
                    });

                    const rating_apply = !!ratingExists; // true if rating exists, false otherwise

                    return {
                        product_id: order.product_id
                            ? order.product_id._id
                            : "",
                        product_name: order.product_name,
                        image: thumbnail,
                        quantity: order.quantity,
                        unit_price: order.unit_price,
                        slug: order.product_id ? order.product_id.slug : "",
                        sub_total: order.sub_total,
                        sku: order.sku,
                        date: formatDate(order.created_at),
                        rating_apply, // Add the rating_apply field
                    };
                })
            );

            return res.status(200).send({
                success: true,
                message: "Order Items fetched successfully",
                data: ordersItems,
                mediaUrl,
            });
        } catch (error) {
            console.error("Error fetching data:", error);
            return res.status(500).send({
                success: false,
                message: "Error fetching data: " + error.message,
            });
        }
    };

    static get_transactions = async (req, res) => {
        try {
            var token = req.body.token;
            const payload = jwt.decode(token, process.env.TOKEN_SECRET);
            const userId = payload.id;

            let transactions = await Transaction.find({ user_id: userId });
            return res.send({
                success: true,
                status: 200,
                message: "Transaction fetched successfully",
                data: transactions,
            });
        } catch (error) {
            console.error("Error fetching data:", error);
            res.send({
                success: false,
                status: 500,
                message: "Error fetching data" + error.message,
            });
        }
    };

    static userBillingAddress = async (req, res) => {
        try {
            var token = req.body.token;
            const payload = jwt.decode(token, process.env.TOKEN_SECRET);
            const userId = payload.id;

            if (!userId) {
                return res.send({
                    success: false,
                    status: 401,
                    message: "Unauthorized access",
                });
            }

            const billingAddresses = await UserBillingAddress.find({
                user_id: userId,
            });
            return res.send({
                success: true,
                status: 200,
                message: "Billing Address fetched successfully",
                data: billingAddresses,
            });
        } catch (error) {
            console.error("Error fetching data:", error);
            res.send({
                success: false,
                status: 500,
                message: "Error fetching data" + error.message,
            });
        }
    };

    static add_userBillingAddress = async (req, res) => {
        try {
            var token = req.body.token;
            const payload = jwt.decode(token, process.env.TOKEN_SECRET);
            const userId = payload.id;

            if (!userId) {
                return res.send({
                    success: false,
                    status: 401,
                    message: "Unauthorized access",
                });
            }

            const userBillingAddress = new UserBillingAddress({
                user_id: userId,
                first_name: req.body.first_name,
                last_name: req.body.last_name,
                email: req.body.email,
                phone: req.body.phone,
                address: req.body.address,
                address2: req.body.address2,
                city: req.body.city,
                state: req.body.state,
                post_code: req.body.post_code,
                company_name: req.body.company_name,
            });

            await userBillingAddress.save();

            return res.send({
                success: true,
                status: 200,
                message: "Billing Address added successfully",
                data: userBillingAddress,
            });
        } catch (error) {
            console.error("Error fetching data:", error);
            res.send({
                success: false,
                status: 500,
                message: "Error fetching data" + error.message,
            });
        }
    };

    static update_userBillingAddress = async (req, res) => {
        try {
            var token = req.body.token;
            const billing_id = req.body.billing_id;
            const payload = jwt.decode(token, process.env.TOKEN_SECRET);
            const user = await UserBillingAddress.findOne({
                _id: billing_id,
            });

            if (!user) {
                return res.send({
                    message: "User not found",
                    status: 404,
                    success: false,
                });
            }

            let data = {
                first_name: req.body.first_name,
                last_name: req.body.last_name,
                email: req.body.email,
                phone: req.body.phone,
                address: req.body.address,
                address2: req.body.address2,
                city: req.body.city,
                state: req.body.state,
                post_code: req.body.post_code,
                company_name: req.body.company_name,
                updated_at: new Date(),
            };

            const updatedData = await UserBillingAddress.findOneAndUpdate(
                { _id: billing_id },
                data
            );

            return res.send({
                success: true,
                status: 200,
                message: "Billing Address updated successfully",
            });
        } catch (error) {
            console.error("Error fetching data:", error);
            res.send({
                success: false,
                status: 500,
                message: "Error fetching data" + error.message,
            });
        }
    };

    static delete_userBillingAddress = async (req, res) => {
        try {
            const { id } = req.query;
            const deletedAddress = await UserBillingAddress.findByIdAndDelete(
                id
            );

            if (!deletedAddress) {
                return res.status(404).json({ message: "Id not found" });
            }

            return res.send({
                success: true,
                status: 200,
                message: "Billing Address deleted successfully",
            });
        } catch (error) {
            console.error("Error fetching data:", error);
            res.send({
                success: false,
                status: 500,
                message: "Error fetching data" + error.message,
            });
        }
    };
}

module.exports = OrderController;

function formatDate(dateString) {
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, "0");
    const month = date.toLocaleString("default", { month: "short" }); // Short month name
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
}
