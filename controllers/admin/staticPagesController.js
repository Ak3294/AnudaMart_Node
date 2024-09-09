const StaticPage = require("../../models/StaticPage");
const Status = require("../../models/Status");
const multer = require("multer");
const path = require("path");
const root = process.cwd();
const imageFilter = require("../../config/imageFilter");
const fs = require("fs");
const config = require("../../config/createStatus");

class StaticPagesController {
    static list = async (req, res) => {
        try {
            const pages = await StaticPage.find()
                .sort({ created_at: -1 })
                .populate("status_id");
            const page = parseInt(req.query.page) || 1; // Current page number, default to 1
            const pageSize = parseInt(req.query.pageSize) || 10; // Items per page, default to 10

            const totalItems = await StaticPage.countDocuments();
            return res.render("admin/static-pages", {
                pages,
                currentPage: page,
                pageSize,
                totalItems,
            });
        } catch (error) {
            console.log(error);
            return res.send(
                "Something went wrong please try again later",
                error.message
            );
        }
    };

    static addGet = async (req, res) => {
        try {
            await config.createPagesStatus();
            let status = await Status.find({
                type: "pages",
            });
            return res.render("admin/add-static-pages", { status });
        } catch (error) {
            console.log(error);
            return res.send(
                "Something went wrong please try again later",
                error.message
            );
        }
    };
    static editGet = async (req, res) => {
        try {
            const id = req.params.id;
            const page = await StaticPage.findOne({
                _id: id,
            });
            await config.createPagesStatus();
            const activeStatus = await Status.findOne({
                type: "pages",
                name: { $regex: new RegExp("^active$", "i") },
            });

            const inactiveStatus = await Status.findOne({
                type: "pages",
                name: { $regex: new RegExp("^inactive$", "i") },
            });
            return res.render("admin/edit-static-pages", {
                page,
                activeStatus,
                inactiveStatus,
            });
        } catch (error) {
            console.log(error);
            return res.send(
                "Something went wrong please try again later",
                error.message
            );
        }
    };

    static create = async (req, res) => {
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

                // Fetch the active and inactive statuses
                const activeStatus = await Status.findOne({
                    type: "pages",
                    name: { $regex: new RegExp("^active$", "i") },
                });

                const inactiveStatus = await Status.findOne({
                    type: "pages",
                    name: { $regex: new RegExp("^inactive$", "i") },
                });

                const insertRecord = StaticPage({
                    title: req.body.title,
                    description: req.body.description,
                    image: req.file ? req.file.filename : "",
                    meta_title: req.body.meta_title,
                    meta_description: req.body.meta_description,
                    meta_keywords: req.body.meta_keywords,
                    slug: req.body.slug,
                    show_in: req.body.show_in,
                    status_id:
                        req.body.status_id === "on"
                            ? activeStatus._id
                            : inactiveStatus._id,
                });
                await insertRecord.save();
                return res.send({
                    success: true,
                    status: 200,
                    message: "StaticPage added successfully",
                });
            });
        } catch (error) {
            console.log(error);
            return res.status(500).send({
                message: "Error creating StaticPage: " + error.message,
            });
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

                const pages = await StaticPage.findOne({
                    _id: req.body.editid,
                });
                if (!pages) {
                    return res
                        .status(404)
                        .send({ message: "editid not found" });
                }

                // Fetch the active and inactive statuses
                const activeStatus = await Status.findOne({
                    type: "pages",
                    name: { $regex: new RegExp("^active$", "i") },
                });

                const inactiveStatus = await Status.findOne({
                    type: "pages",
                    name: { $regex: new RegExp("^inactive$", "i") },
                });

                const updatedData = {
                    title: req.body.title,
                    description: req.body.description,
                    image: req.file ? req.file.filename : pages.image,
                    meta_title: req.body.meta_title,
                    meta_description: req.body.meta_description,
                    meta_keywords: req.body.meta_keywords,
                    slug: req.body.slug,
                    show_in: req.body.show_in,
                    status_id:
                        req.body.status_id === "on"
                            ? activeStatus._id
                            : inactiveStatus._id,
                    updated_at: new Date(),
                };

                if (req.file) {
                    updatedData.image = req.file.filename;
                }
                await StaticPage.updateOne(
                    { _id: req.body.editid },
                    updatedData
                );

                if (req.file && pages.image) {
                    fs.unlink(
                        path.join(
                            root,
                            "/public/dist/pages/" + pages.image
                        ),
                        (err) => {
                            if (err) {
                                console.log(err);
                            }
                        }
                    );
                }
                return res.send({
                    success: true,
                    status: 200,
                    message: "StaticPage updated successfully",
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
            await StaticPage.findByIdAndDelete(req.params.id);
            return res.send({
                success: true,
                status: 200,
                message: "StaticPage deleted successfully",
            });
        } catch (error) {
            console.log(error);
            return res.status(500).send({
                message: "Error deleting StaticPage: " + error.message,
            });
        }
    };
}

// Set The Storage Engine
const storage = multer.diskStorage({
    destination: path.join(root, "/public/dist/pages"),
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
}).single("image");

const editupload = multer({
    storage: storage,
    // limits: {
    //     fileSize: 5000000
    // },
    fileFilter: imageFilter,
}).single("image");

module.exports = StaticPagesController;
