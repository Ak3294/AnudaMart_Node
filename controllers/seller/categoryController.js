const RequestCategory = require("../../models/RequestCategory");
const Category = require("../../models/Category");

class CategoryController {
    static list = async (req, res) => {
        let categories = await Category.aggregate([
            {
                $lookup: {
                    from: "categories",
                    localField: "parent_id",
                    foreignField: "_id",
                    as: "parent",
                },
            },
            {
                $lookup: {
                    from: "statuses",
                    localField: "status_id",
                    foreignField: "_id",
                    as: "status",
                },
            },
            {
                $unwind: {
                    path: "$status",
                    preserveNullAndEmptyArrays: true,
                },
            },
            {
                $addFields: {
                    parent_name: { $arrayElemAt: ["$parent.name", 0] },
                    parent_id: { $arrayElemAt: ["$parent", 0] },
                    status_name: "$status",
                },
            },
            {
                $project: {
                    _id: 1,
                    name: 1,
                    parent_id: 1,
                    parent_name: 1,
                    status_id: 1,
                    status_name: 1,
                    created_at: 1,
                    updated_at: 1,
                },
            },
            {
                $sort: {
                    created_at: -1,
                },
            },
        ]).exec();
        await Category.populate(categories, { path: "status_id" });

        const reqcategories = await RequestCategory.find({
            vendor_id: req.session.seller._id,
        }).populate("parent_id");

        const page = parseInt(req.query.page) || 1; // Current page number, default to 1
        const pageSize = parseInt(req.query.pageSize) || 10; // Items per page, default to 10

        const totalItems = reqcategories.length;

        return res.render("seller/categories", {
            categories,
            reqcategories,
            currentPage: page,
            pageSize,
            totalItems,
        });
    };

    static add = async (req, res) => {
        try {
            const insertRecord = RequestCategory({
                vendor_id: req.session.seller._id
                    ? req.session.seller._id
                    : null,
                req_category_name: req.body.req_category_name,
                parent_id: req.body.parent_id ? req.body.parent_id : null,
            });
            await insertRecord.save();
            return res.send({
                status: 200,
                message: "Category Requested Successfully",
            });
        } catch (error) {
            console.log(error);
            return res
                .status(500)
                .send({ message: "Error request category: " + error.message });
        }
    };

    static delete = async (req, res) => {
        try {
            await RequestCategory.findByIdAndDelete(req.params.id);
            return res.send({
                status: 200,
                message: "Request Category deleted successfully",
            });
        } catch (error) {
            console.log(error);
            return res.status(500).send({
                message: "Error deleting Request category: " + error.message,
            });
        }
    };
}

module.exports = CategoryController;
