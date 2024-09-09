const Coupon = require("../../models/Coupon");
const Product = require("../../models/Product");
const Status = require("../../models/Status");
const config = require("../../config/createStatus");
const mongoose = require("mongoose");

class CouponController {
    static list = async (req, res) => {
        try {
            const product_coupon = await Coupon.find({
                create_by: req.session.seller._id,
            })
                .sort({ created_at: -1 })
                .populate("product_id status_id");

            let products = await Product.find().sort({
                created_at: -1,
            });

            await config.createCouponStatus();
            const activeStatus = await Status.findOne({
                type: "coupon",
                name: { $regex: new RegExp("^active$", "i") },
            });

            const page = parseInt(req.query.page) || 1; // Current page number, default to 1
            const pageSize = parseInt(req.query.pageSize) || 10; // Items per page, default to 10

            const totalItems = product_coupon.length;
            return res.render("seller/coupons", {
                product_coupon,
                products,
                activeStatus,
                currentPage: page,
                pageSize,
                totalItems,
            });
        } catch (error) {
            console.log(error);
            return res.status(500).send({
                message: "Error list coupon: " + error.message,
            });
        }
    };

    static add_coupon = async (req, res) => {
        try {
            await config.createCouponStatus();

            // Fetch the active and inactive statuses
            const activeStatus = await Status.findOne({
                type: "coupon",
                name: { $regex: new RegExp("^active$", "i") },
            });

            const inactiveStatus = await Status.findOne({
                type: "coupon",
                name: { $regex: new RegExp("^inactive$", "i") },
            });

            // Validate category_id and product_id
            if (
                req.body.product_id &&
                req.body.product_id.length > 0 &&
                !req.body.product_id.every((id) =>
                    mongoose.Types.ObjectId.isValid(id)
                )
            ) {
                return res.status(400).json({ message: "Invalid product_id" });
            }

            const productIdArray =
                req.body.product_id && req.body.product_id.length > 0
                    ? req.body.product_id
                    : undefined;

            const newCoupon = Coupon({
                type: req.body.type,
                discount: req.body.discount,
                date_range: req.body.date_range,
                message: req.body.message,
                product_id: productIdArray,
                status_id:
                    req.body.status_id === "on"
                        ? activeStatus._id
                        : inactiveStatus._id,
                create_by: req.session.seller._id,
            });
            await newCoupon.save();
            return res.send({
                status: 200,
                message: "Coupon Added successfully",
            });
        } catch (error) {
            console.log(error);
            return res.status(500).send({
                message: "Error creating coupon: " + error.message,
            });
        }
    };

    static edit = async (req, res) => {
        try {
            const coupon = await Coupon.findOne({
                _id: req.body.editid,
            });

            await config.createCouponStatus();

            // Fetch the active and inactive statuses
            const activeStatus = await Status.findOne({
                type: "coupon",
                name: { $regex: new RegExp("^active$", "i") },
            });

            const inactiveStatus = await Status.findOne({
                type: "coupon",
                name: { $regex: new RegExp("^inactive$", "i") },
            });

            // Validate category_id and product_id
            if (
                req.body.product_id &&
                req.body.product_id.length > 0 &&
                !req.body.product_id.every((id) =>
                    mongoose.Types.ObjectId.isValid(id)
                )
            ) {
                return res.status(400).json({ message: "Invalid product_id" });
            }

            const productIdArray =
                req.body.product_id && req.body.product_id.length > 0
                    ? req.body.product_id
                    : undefined;

            const updateData = {
                type: req.body.type,
                discount: req.body.discount,
                date_range: req.body.date_range,
                message: req.body.message,
                product_id: productIdArray,
                status_id:
                    req.body.status_id === "on"
                        ? activeStatus._id
                        : inactiveStatus._id,
                updated_at: new Date(),
            };

            await Coupon.findOneAndUpdate(
                {
                    _id: req.body.editid,
                },
                updateData
            );

            return res.send({
                status: 200,
                message: "Coupon updated successfully",
            });
        } catch (error) {
            console.log("Error updating coupon: ", error);
            return res.status(500).send({
                message: "Error updating coupon: " + error.message,
            });
        }
    };

    static delete = async (req, res) => {
        try {
            await Coupon.findByIdAndDelete(req.params.id);
            return res.send({
                status: 200,
                message: "Coupon deleted successfully",
            });
        } catch (error) {
            console.log(error);
            return res.status(500).send({
                message: "Error deleting coupon: " + error.message,
            });
        }
    };
}
module.exports = CouponController;
