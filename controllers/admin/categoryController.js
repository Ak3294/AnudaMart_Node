const Category = require("../../models/Category");
const Status = require("../../models/Status");
const multer = require("multer");
const path = require("path");
const root = process.cwd();
const imageFilter = require("../../config/imageFilter");
const fs = require("fs");
const config = require("../../config/createStatus");

class CategoryController {
    static list = async (req, res) => {
        try {
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
                        icon: 1,
                        slug: 1,
                        parent_id: 1,
                        parent_name: 1,
                        meta_title: 1,
                        meta_description: 1,
                        is_featured: 1,
                        commission_type: 1,
                        commission: 1,
                        status_id: 1,
                        status_name: 1,
                        description: 1,
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

            await config.createCategoryStatus();
            const activeStatus = await Status.findOne({
                type: "category",
                name: { $regex: new RegExp("^active$", "i") },
            });
            const page = parseInt(req.query.page) || 1; // Current page number, default to 1
            const pageSize = parseInt(req.query.pageSize) || 10; // Items per page, default to 10

            const totalItems = await Category.countDocuments();
            return res.render("admin/category", {
                categories,
                activeStatus,
                currentPage: page,
                pageSize,
                totalItems,
            });
        } catch (error) {
            return res.status(500).send({
                message: "Error fetching categories: " + error.message,
            });
        }
    };

    static add = async (req, res) => {
        try {
            upload(req, res, async function (err) {
                if (req.fileValidationError) {
                    return res.send(req.fileValidationError);
                } else if (err instanceof multer.MulterError) {
                    console.log(err);
                    return res.send(err);
                } else if (err) {
                    console.log(err);
                    return res.send(err);
                }

                // Check if the slug already exists in the Category collection
                const existingCategory = await Category.findOne({
                    slug: req.body.slug,
                });
                if (existingCategory) {
                    return res.status(400).send({
                        message: "Slug must be unique",
                    });
                }

                await config.createCategoryStatus();
                // Fetch the active and inactive statuses
                const activeStatus = await Status.findOne({
                    type: "category",
                    name: { $regex: new RegExp("^active$", "i") },
                });

                const inactiveStatus = await Status.findOne({
                    type: "category",
                    name: { $regex: new RegExp("^inactive$", "i") },
                });

                const insertRecord = Category({
                    icon: req.file ? req.file.filename : null,
                    name: req.body.name,
                    slug: req.body.slug,
                    meta_title: req.body.meta_title,
                    meta_description: req.body.meta_description,
                    is_featured: req.body.is_featured === "on" ? true : false,
                    parent_id: req.body.parent_id ? req.body.parent_id : null,
                    commission_type: req.body.commission_type,
                    commission: req.body.commission,
                    description: req.body.description.replace(
                        /<\/?[^>]+(>|$)/g,
                        ""
                    ),
                    status_id:
                        req.body.status_id === "on"
                            ? activeStatus._id
                            : inactiveStatus._id,
                });
                await insertRecord.save();
                return res.send({
                    status: 200,
                    message: "Category added successfully",
                });
            });
        } catch (error) {
            console.log(error);
            return res
                .status(500)
                .send({ message: "Error creating category: " + error.message });
        }
    };

    static edit = async (req, res) => {
        try {
            editupload(req, res, async function (err) {
                if (req.fileValidationError) {
                    return res.send(req.fileValidationError);
                } else if (err instanceof multer.MulterError) {
                    console.log(err);
                    return res.send(err);
                } else if (err) {
                    console.log(err);
                    return res.send(err);
                }

                const category = await Category.findOne({
                    _id: req.body.editid,
                });
                if (!category) {
                    return res
                        .status(404)
                        .send({ message: "editid not found" });
                }

                // Check if the slug already exists in the Category collection
                const existingSlug = await Category.findOne({
                    slug: req.body.edit_slug,
                });
                if (existingSlug && existingSlug._id != req.body.editid) {
                    return res.status(400).send({
                        message: "Slug must be unique",
                    });
                }

                await config.createCategoryStatus();
                const activeStatus = await Status.findOne({
                    type: "category",
                    name: { $regex: new RegExp("^active$", "i") },
                });

                const inactiveStatus = await Status.findOne({
                    type: "category",
                    name: { $regex: new RegExp("^inactive$", "i") },
                });

                const updatedData = {
                    name: req.body.edit_name,
                    slug: req.body.edit_slug,
                    meta_title: req.body.edit_meta_title,
                    meta_description: req.body.edit_meta_description,
                    parent_id: req.body.edit_parent_id
                        ? req.body.edit_parent_id
                        : null,
                    is_featured:
                        req.body.edit_is_featured === "on" ? true : false,
                    description: req.body.edit_description,
                    status_id:
                        req.body.edit_status_id === "on"
                            ? activeStatus._id
                            : inactiveStatus._id,
                    commission_type: req.body.edit_commission_type,
                    commission: req.body.edit_commission,
                    updated_at: new Date(),
                };

                if (req.file) {
                    updatedData.icon = req.file ? req.file.filename : null;
                }
                await Category.findOneAndUpdate(
                    { _id: req.body.editid },
                    updatedData,
                    { new: true }
                );

                if (req.file && category.icon) {
                    fs.unlink(
                        path.join(
                            root,
                            "/public/dist/category/" + category.icon
                        ),
                        (err) => {
                            if (err) {
                                console.log(err);
                            }
                        }
                    );
                }
                return res.send({
                    status: 200,
                    message: "Category updated successfully",
                });
            });
        } catch (error) {
            console.log(error);
            return res
                .status(500)
                .send({ message: "Error updating category: " + error.message });
        }
    };
    static delete = async (req, res) => {
        try {
            await Category.findByIdAndDelete(req.params.id);
            return res.send({
                status: 200,
                message: "Category deleted successfully",
            });
        } catch (error) {
            console.log(error);
            return res
                .status(500)
                .send({ message: "Error deleting category: " + error.message });
        }
    };
}

// Set The Storage Engine
const storage = multer.diskStorage({
    destination: path.join(root, "/public/dist/category"),
    filename: function (req, file, cb) {
        cb(
            null,
            file.fieldname + "-" + Date.now() + path.extname(file.originalname)
        );
    },
});

// Init Upload
const upload = multer({
    storage: storage,
    // limits: {
    //     fileSize: 5000000
    // },
    fileFilter: imageFilter,
}).single("icon");

const editupload = multer({
    storage: storage,
    // limits: {
    //     fileSize: 5000000
    // },
    fileFilter: imageFilter,
}).single("editicon");

module.exports = CategoryController;
