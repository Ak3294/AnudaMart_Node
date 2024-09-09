const Order = require("../../models/Order");
const OrderHistory = require("../../models/OrderHistory");
const BillingAddress = require("../../models/BillingAddress");
const Status = require("../../models/Status");

class OrderController {
    static list = async (req, res) => {
        const orders = await Order.find().populate("user_id status_id");
        const totalOrdersCount = await Order.countDocuments();
        return res.render("admin/orders", { orders, totalOrdersCount });
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

            return res.render("admin/order-overview", {
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

    // Update payment status in orders table
    static updatePaymentStatus = async (req, res) => {
        try {
            const { status, order_id, reason } = req.body;

            // Update the payment_status and reason in the orders table
            await Order.updateOne(
                { _id: order_id },
                {
                    payment_status: status,
                    reason: reason, // Save the reason in the database
                }
            );

            res.status(200).send({
                message: "Payment status updated successfully",
            });
        } catch (error) {
            console.error(error);
            res.status(500).send({
                message: "Failed to update payment status: " + error.message,
            });
        }
    };

    // Update order status in orders table
    static updateOrderStatus = async (req, res) => {
        try {
            const { orderStatus, order_id } = req.body;

            // Find the status ID from the Status collection
            const status = await Status.findOne({
                type: "order",
                name: orderStatus,
            });

            if (!status) {
                return res.status(404).send({ message: "Status not found" });
            }

            // Update the status_id in the orders table with the found status ID
            await Order.updateOne({ _id: order_id }, { status_id: status._id });

            res.status(200).send({
                message: "Order status updated successfully",
            });
        } catch (error) {
            console.error(error);
            res.status(500).send({
                message: "Failed to update order status: " + error.message,
            });
        }
    };
}

module.exports = OrderController;
