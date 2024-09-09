const Adminauth = require("../../models/Adminauth");
const imageFilter = require("../../config/imageFilter");
const bcrypt = require("bcrypt");
const multer = require("multer");
const path = require("path");
const root = process.cwd();
const fs = require("fs");

// Set storage engine for users
const storage = multer.diskStorage({
    destination: path.join(root, "/public/dist/staff"),
    filename: function (req, file, cb) {
        cb(
            null,
            file.fieldname + "_" + Date.now() + path.extname(file.originalname)
        );
    },
});

// Init upload for users
const upload = multer({
    storage: storage,
    fileFilter: imageFilter,
}).single("image");

class staffController {
    static list = async (req, res) => {
        let staffs = await Adminauth.find().sort({
            created_at: -1,
        });
        const page = parseInt(req.query.page) || 1;
        const limit = 10;
        const startIndex = (page - 1) * limit;
        try {
            const staff = await Adminauth.find({ type: "s" })
                .skip(startIndex)
                .limit(limit);
            const totalStaffs = await Adminauth.countDocuments();
            const totalPages = Math.ceil(totalStaffs / limit);
            return res.render("admin/staff", {
                staff,
                staffs,
                totalPages,
                currentPage: page,
                totalStaffs,
            });
        } catch (error) {
            return res.status(500).send({
                message: "Error fetching staff: " + error.message,
            });
        }
    };
    static addGET = async (req, res) => {
        try {
            return res.render("admin/add-staff");
        } catch (error) {
            return res.status(500).send({
                message: "Error fetching staff: " + error.message,
            });
        }
    };

    static create = async (req, res) => {
        upload(req, res, async (err) => {
            if (err) {
                return res.status(400).send({ message: err.message });
            }

            const {
                username,
                first_name,
                last_name,
                email,
                phone,
                password,
                confirm_password,
            } = req.body;

            if (password !== confirm_password) {
                return res.status(401).json({
                    message: "Password and Confirm Password do not match",
                });
            }

            try {
                const saltRounds = 10;
                const salt = await bcrypt.genSalt(saltRounds);
                const hashedPassword = await bcrypt.hash(password, salt);

                const staffExists = await Adminauth.findOne({
                    email: email,
                    username: username,
                    type: "s",
                });

                if (staffExists) {
                    return res
                        .status(401)
                        .json({ message: "Staff already exists" });
                }

                const staff = new Adminauth({
                    image: req.file.filename,
                    type: "s",
                    username: username,
                    first_name: first_name,
                    last_name: last_name,
                    email: email,
                    phone: phone,
                    password: hashedPassword,
                });

                await staff.save();
                return res.send({
                    status: 200,
                    message: "Staff Add successfully",
                });
            } catch (error) {
                console.error(error);
                return res.status(500).send({
                    message: "Something went wrong, please try again later",
                    error: error.message,
                });
            }
        });
    };

    static edit = async (req, res) => {
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

                // Find the existing staff record
                const staff = await Adminauth.findOne({ _id: req.body.editid });

                if (!staff) {
                    return res.status(404).send({ message: "User not found" });
                }

                // Prepare the updated data
                let updatedData = {
                    username: req.body.edit_user_name,
                    first_name: req.body.edit_first_name,
                    last_name: req.body.edit_last_name,
                    email: req.body.edit_email,
                    phone: req.body.edit_phone,
                    updated_at: new Date(),
                };

                // Update the image only if a new file is uploaded
                if (req.file) {
                    updatedData.image = req.file ? req.file.filename : "";

                    // Remove the old image file from the server if a new image is uploaded
                    if (staff.image) {
                        fs.unlink(
                            path.join(
                                root,
                                "/public/dist/staff/" + staff.image
                            ),
                            (err) => {
                                if (err) {
                                    console.log(
                                        "Error deleting old image:",
                                        err
                                    );
                                }
                            }
                        );
                    }
                } else {
                    // Retain the existing image if no new image is uploaded
                    updatedData.image = staff.image;
                }

                // Update the staff record in the database
                await Adminauth.findOneAndUpdate(
                    { _id: req.body.editid },
                    updatedData,
                    { new: true }
                );

                return res.send({
                    status: 200,
                    message: "Staff updated successfully",
                });
            });
        } catch (error) {
            console.log(error);
            return res.status(500).send({
                message: "Something went wrong, please try again later.",
                error: error.message,
            });
        }
    };

    static delete = async (req, res) => {
        try {
            await Adminauth.findByIdAndDelete(req.params.id);

            return res.send({
                status: 200,
                message: "Staff deleted successfully",
            });
        } catch (error) {
            console.log(error);
            return res
                .status(500)
                .send({ message: "Error deleting staff: " + error.message });
        }
    };
}

module.exports = staffController;
