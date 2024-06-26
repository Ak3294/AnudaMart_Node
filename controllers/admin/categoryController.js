const Category = require("../../models/Category");
const Status = require("../../models/Status");
const multer = require("multer");
const path = require("path");
const root = process.cwd();
const imageFilter = require("../../config/imageFilter");
const fs = require("fs");
let msg = "Something went wrong please try again later";

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
                    $addFields: {
                        parent_name: { $arrayElemAt: ["$parent.name", 0] },
                    },
                },
                {
                    $project: {
                        _id: 1,
                        name: 1,
                        icon: 1,
                        slug: 1,
                        parent_name: 1,
                        meta_title: 1,
                        meta_description: 1,
                        status_id: 1,
                        created_at: 1,
                        updated_at: 1,
                    },
                },
                {
                    $sort: {
                        created_at: -1,
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
                    $addFields: {
                        status_name: { $arrayElemAt: ["$status.name", 0] },
                    },
                },
                {
                    $project: {
                        _id: 1,
                        name: 1,
                        icon: 1,
                        slug: 1,
                        parent_name: 1,
                        meta_title: 1,
                        meta_description: 1,
                        status_name: 1,
                        created_at: 1,
                        updated_at: 1,
                    },
                },
            ]).exec();

            let statuses = await Status.find().sort({
                created_at: -1,
            });
            return res.render("admin/category", {
                categories,
                statuses,
            });
        } catch (error) {
            return res.status(500).send(msg);
        }
    };

    static add = async (req, res) => {
        try {
            upload(req, res, async function (err) {
                if (req.fileValidationError) {
                    return res.send(req.fileValidationError);
                } else if (!req.file) {
                    return res.send({
                        success: false,
                        status: 400,
                        message: "Please upload an image",
                    });
                } else if (err instanceof multer.MulterError) {
                    console.log(err);
                    return res.send(err);
                } else if (err) {
                    console.log(err);
                    return res.send(err);
                }

                const insertRecord = Category({
                    icon: req.file.filename,
                    name: req.body.name,
                    slug: req.body.slug,
                    meta_title: req.body.meta_title,
                    meta_description: req.body.meta_description,
                    parent_id: req.body.parent_id,
                    status_id: req.body.status_id,
                });
                await insertRecord.save();
                return res.send({
                    success: true,
                    status: 200,
                    message: "Category added successfully",
                });
            });
        } catch (error) {
            console.log(error);
            return res.status(500).send(msg);
        }
    };

    static edit = async (req, res) => {
        try {
            // upload(req, res, async function (err) {
            //     if (req.fileValidationError) {
            //         return res.send(req.fileValidationError);
            //     } else if (err instanceof multer.MulterError) {
            //         console.log(err);
            //         return res.send(err);
            //     } else if (err) {
            //         console.log(err);
            //         return res.send(err);
            //     }

            const category = await Category.findOne({
                _id: req.body.editid,
            });

            // if (req.file) {
            //     fs.unlinkSync(
            //         root + "/public/dist/category/" + category.icon
            //     );
            //     category.icon = req.file.filename;
            // }

            await Category.findOneAndUpdate(
                {
                    _id: req.body.editid,
                },
                {
                    // icon: category.icon,
                    name: req.body.name,
                    slug: req.body.slug,
                    meta_title: req.body.meta_title,
                    meta_description: req.body.meta_description,
                    parent_id: req.body.parent_id,
                    status_id: req.body.status_id,
                    updated_at: Date.now(),
                }
            );
            return res.send({
                success: true,
                status: 200,
                message: "Category updated successfully",
            });
            // });
        } catch (error) {
            console.log(error);
            return res.status(500).send(msg);
        }
    };

    static delete = async (req, res) => {
        try {
            await Category.findByIdAndDelete(req.params.id);
            return res.send({
                success: true,
                status: 200,
                message: "Category deleted successfully",
            });
        } catch (error) {
            console.log(error);
            return res.status(500).send(msg);
        }
    };
}

// Set The Storage Engine
const storage = multer.diskStorage({
    destination: path.join(root, "/public/dist/category"),
    filename: function (req, file, cb) {
        cb(null, `${Date.now()}.jpg`);
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

module.exports = CategoryController;
