const Slider = require("../../models/Slider");
const Status = require("../../models/Status");
const multer = require("multer");
const path = require("path");
const root = process.cwd();
const imageFilter = require("../../config/imageFilter");
const fs = require("fs");
const config = require("../../config/createStatus");
const { title } = require("process");

class SliderController {
    static list = async (req, res) => {
        try {
            let sliders = await Slider.find({})
                .sort({ created_at: -1 })
                .populate("status_id");

            await config.createSliderStatus();
            const activeStatus = await Status.findOne({
                type: "slider",
                name: { $regex: new RegExp("^active$", "i") },
            });
            const page = parseInt(req.query.page) || 1; // Current page number, default to 1
            const pageSize = parseInt(req.query.pageSize) || 10; // Items per page, default to 10

            const totalItems = await Slider.countDocuments();
            return res.render("admin/slider", {
                sliders,
                activeStatus,
                currentPage: page,
                pageSize,
                totalItems,
            });
        } catch (error) {
            return res.status(500).send({
                message: "Error fetching sliders: " + error.message,
            });
        }
    };

    static add = async (req, res) => {
        try {
            upload(req, res, async function (err) {
                if (req.fileValidationError) {
                    return res.send(req.fileValidationError);
                } else if (!req.file) {
                    return res.send({
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

                await config.createSliderStatus();
                // Fetch the active and inactive statuses
                const activeStatus = await Status.findOne({
                    type: "slider",
                    name: { $regex: new RegExp("^active$", "i") },
                });

                const inactiveStatus = await Status.findOne({
                    type: "slider",
                    name: { $regex: new RegExp("^inactive$", "i") },
                });

                const insertRecord = Slider({
                    image: req.file.filename,
                    title: req.body.title,
                    url: req.body.url,
                    description: req.body.description,
                    status_id:
                        req.body.status_id === "on"
                            ? activeStatus._id
                            : inactiveStatus._id,
                });
                await insertRecord.save();
                return res.send({
                    status: 200,
                    message: "Slider added successfully",
                });
            });
        } catch (error) {
            console.log(error);
            return res
                .status(500)
                .send({ message: "Error creating slider: " + error.message });
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

                const slider = await Slider.findOne({
                    _id: req.body.editid,
                });
                if (!slider) {
                    return res
                        .status(404)
                        .send({ message: "editid not found" });
                }

                await config.createSliderStatus();
                const activeStatus = await Status.findOne({
                    type: "slider",
                    name: { $regex: new RegExp("^active$", "i") },
                });

                const inactiveStatus = await Status.findOne({
                    type: "slider",
                    name: { $regex: new RegExp("^inactive$", "i") },
                });

                const updatedData = {
                    title: req.body.edit_title,
                    url: req.body.edit_url,
                    description: req.body.edit_description,
                    status_id:
                        req.body.edit_status_id === "on"
                            ? activeStatus._id
                            : inactiveStatus._id,

                    updated_at: new Date(),
                };

                if (req.file) {
                    updatedData.image = req.file ? req.file.filename : null;
                }
                await Slider.findOneAndUpdate(
                    { _id: req.body.editid },
                    updatedData,
                    { new: true }
                );

                if (req.file && slider.image) {
                    fs.unlink(
                        path.join(root, "/public/dist/slider/" + slider.image),
                        (err) => {
                            if (err) {
                                console.log(err);
                            }
                        }
                    );
                }
                return res.send({
                    status: 200,
                    message: "Slider updated successfully",
                });
            });
        } catch (error) {
            console.log(error);
            return res
                .status(500)
                .send({ message: "Error updating slider: " + error.message });
        }
    };
    static delete = async (req, res) => {
        try {
            await Slider.findByIdAndDelete(req.params.id);
            return res.send({
                status: 200,
                message: "Slider deleted successfully",
            });
        } catch (error) {
            console.log(error);
            return res
                .status(500)
                .send({ message: "Error deleting slider: " + error.message });
        }
    };
}

// Set The Storage Engine
const storage = multer.diskStorage({
    destination: path.join(root, "/public/dist/slider"),
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
}).single("editimage");

module.exports = SliderController;
