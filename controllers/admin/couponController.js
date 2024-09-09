const Coupon = require("../../models/Coupon");
const Category = require("../../models/Category");
const Product = require("../../models/Product");
const Status = require("../../models/Status");
const config = require("../../config/createStatus");
const mongoose = require("mongoose");

class CouponController {
    static list = async (req, res) => {
        try {
            const category_coupon = await Coupon.find({
                $and: [
                    { category_id: { $exists: true } },
                    { category_id: { $ne: [] } },
                    { category_id: { $ne: null } },
                    { create_by: null },
                ],
            })
                .sort({ created_at: -1 })
                .populate("category_id status_id");

            const product_coupon = await Coupon.find({
                $and: [
                    { product_id: { $exists: true } },
                    { product_id: { $ne: [] } },
                    { product_id: { $ne: null } },
                    { create_by: null },
                ],
            })
                .sort({ created_at: -1 })
                .populate("product_id status_id");

            const sub_total_coupon = await Coupon.find({
                $or: [
                    { category_id: { $exists: false } },
                    { category_id: { $eq: null } },
                    { category_id: { $size: 0 } },
                    { product_id: { $exists: false } },
                    { product_id: { $eq: null } },
                    { product_id: { $size: 0 } },
                    { create_by: null },
                ],
                coupon_code: { $exists: true, $ne: null },
            })
                .sort({ created_at: -1 })
                .populate("status_id");

            let categories = await Category.find({
                parent_id: null,
            }).sort({
                created_at: -1,
            });
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

            const total_category_coupon = category_coupon.length;
            const total_product_coupon = product_coupon.length;
            const total_sub_total_coupon = sub_total_coupon.length;
            
            return res.render("admin/coupons", {
                category_coupon,
                product_coupon,
                sub_total_coupon,
                categories,
                products,
                activeStatus,
                total_category_coupon,
                total_product_coupon,
                total_sub_total_coupon,
                currentPage: page,
                pageSize,
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
                req.body.category_id &&
                req.body.category_id.length > 0 &&
                !req.body.category_id.every((id) =>
                    mongoose.Types.ObjectId.isValid(id)
                )
            ) {
                return res.status(400).json({ message: "Invalid category_id" });
            }
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

            const catIdArray =
                req.body.category_id && req.body.category_id.length > 0
                    ? req.body.category_id
                    : undefined;

            const newCoupon = Coupon({
                category_id: catIdArray,
                type: req.body.type,
                discount: req.body.discount,
                date_range: req.body.date_range,
                message: req.body.message,
                product_id: productIdArray,
                coupon_code: req.body.coupon_code || undefined,
                status_id:
                    req.body.status_id === "on"
                        ? activeStatus._id
                        : inactiveStatus._id,
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
                req.body.category_id &&
                req.body.category_id.length > 0 &&
                !req.body.category_id.every((id) =>
                    mongoose.Types.ObjectId.isValid(id)
                )
            ) {
                return res.status(400).json({ message: "Invalid category_id" });
            }
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

            const catIdArray =
                req.body.category_id && req.body.category_id.length > 0
                    ? req.body.category_id
                    : undefined;

            const updateData = {
                category_id: catIdArray,
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

            // Only update coupon_code if it is provided
            if (req.body.coupon_code) {
                updateData.coupon_code = req.body.coupon_code;
            }

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
