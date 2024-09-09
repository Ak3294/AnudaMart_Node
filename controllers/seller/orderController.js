const Order = require("../../models/Order");
const OrderHistory = require("../../models/OrderHistory");
const BillingAddress = require("../../models/BillingAddress");

class OrderController {
    static list = async (req, res) => {
        const orders = await Order.find({
            user_id: req.session.seller._id,
        }).populate("user_id status_id");
        const totalOrdersCount = orders.length;

        return res.render("seller/order", { orders, totalOrdersCount });
    };

    static order_overview = async (req, res) => {
        try {
            let orderId = req.params.id;
            const order = await Order.findOne({
                _id: orderId,
            }).populate("user_id status_id");
            const record = await OrderHistory.find({
                order_id: orderId,
            }).populate("order_id product_id");
            const billing_address = await BillingAddress.findOne({
                order_id: orderId,
            }).populate("order_id");

            return res.render("seller/order-overview", {
                order,
                record,
                billing_address,
            });
        } catch (error) {
            console.log(error);
            return res.status(500).send({
                message: "Error creating order detail: " + error.message,
            });
        }
    };
}

module.exports = OrderController;
