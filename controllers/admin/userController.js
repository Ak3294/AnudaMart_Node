const User = require("../../models/User");
const Status = require("../../models/Status");
const bcrypt = require("bcrypt");
const multer = require("multer");
const path = require("path");
const root = process.cwd();
const imageFilter = require("../../config/imageFilter");
const fs = require("fs");
const config = require("../../config/createStatus");
const Order = require("../../models/Order");

// Set The Storage Engine
const storage = multer.diskStorage({
    destination: path.join(root, "/public/dist/users"),
    filename: function (req, file, cb) {
        cb(
            null,
            file.fieldname + "_" + Date.now() + path.extname(file.originalname)
        );
    },
});

// Init Upload
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5000000,
    },
    fileFilter: imageFilter,
}).single("image");

class UserController {
    static list = async (req, res) => {
        try {
            const users = await User.find({
                user_type: "u",
            });
            let statuses = await Status.find({
                type: "user",
            }).sort({
                created_at: -1,
            });
            return res.render("admin/user", { users, statuses });
        } catch (error) {
            return res
                .status(500)
                .send("Error fetching users: " + error.message);
        }
    };

    static create = async (req, res) => {
        try {
            const first_name = req.body.first_name;
            const last_name = req.body.last_name;
            const email = req.body.email;
            const password = req.body.password;
            const confirm_password = req.body.confirm_password;
            const status_id = req.body.status_id;

            if (password !== confirm_password)
                return res.status(401).send({
                    message: "Password and Confirm Password do not match",
                });

            const salt = await bcrypt.genSalt(Number(process.env.SALT_ROUNDS));
            const hashedpassword = await bcrypt.hash(password, salt);
            const hashedconfirm_password = await bcrypt.hash(
                confirm_password,
                salt
            );

            const userExists = await User.findOne({
                email: email,
                user_type: "u",
            });
            if (userExists) {
                return res.status(401).send({
                    message: "User already exists",
                });
            }

            await config.createUserStatus();
            const activeStatus = await Status.findOne({
                type: "user",
                name: { $regex: new RegExp("^active$", "i") },
            });

            const user = await User({
                user_type: "u",
                first_name: first_name,
                last_name: last_name,
                email: email,
                password: hashedpassword,
                confirm_password: hashedconfirm_password,
                status: status_id ? status_id : activeStatus._id,
            });
            await user.save();
            return res.send({
                status: 200,
                message: "User Add successfully",
            });
        } catch (error) {
            console.log(error);
            return res.status(500).send({
                message: "Something went wrong please try again later",
                error: error.message,
            });
        }
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

                const user = await User.findOne({ _id: req.body.editid });
                if (!user) {
                    return res.status(404).send({ message: "user not found" });
                }

                let updatedData = {
                    first_name: req.body.edit_first_name,
                    last_name: req.body.edit_last_name,
                    email: req.body.edit_email,
                    phone: req.body.edit_phone,
                    dob: req.body.edit_dob,
                    address: req.body.edit_address,
                    pincode: req.body.edit_pincode,
                    additional_info: req.body.edit_additional_info,
                    status_id: req.body.status_id,
                    updated_at: new Date(),
                };

                if (req.file) {
                    updatedData.image = req.file ? req.file.filename : null;
                }
                await User.findOneAndUpdate(
                    { _id: req.body.editid },
                    updatedData,
                    { new: true }
                );

                if (req.file && user.image) {
                    const oldImagePath = path.join(
                        root,
                        "/public/dist/users/",
                        user.image
                    );

                    if (fs.existsSync(oldImagePath)) {
                        try {
                            fs.unlinkSync(oldImagePath);
                        } catch (err) {
                            console.error("Error deleting old image:", err);
                        }
                    }
                }
                return res.status(200).send({
                    status: 200,
                    message: "User Update Successfully",
                });
            });
        } catch (error) {
            console.log(error);
            return res.status(500).send({
                message: "Something went wrong please try again later",
                error: error.message,
            });
        }
    };

    static view = async (req, res) => {
        try {
            let id = req.params.id;
            let user = await User.findOne({ _id: id });
            if (!user) {
                return res.status(404).send("User not found");
            }

            const orders = await Order.find({ user_id: user._id }).populate(
                "user_id status_id"
            );
            const totalOrdersCount = await Order.countDocuments();

            return res.render("admin/orders", {
                user,
                orders,
                totalOrdersCount,
            });
        } catch (error) {
            console.error("Error fetching user:", error);
            return res
                .status(500)
                .send("Error fetching user details", error.message);
        }
    };

    static delete = async (req, res) => {
        try {
            const user = await User.findOne({ _id: req.params.id });
            if (!user) {
                return res.status(404).send({ message: "user not found" });
            }
            await User.findByIdAndDelete(req.params.id);
            if (user.image) {
                fs.unlinkSync(
                    path.join(root, "/public/dist/users/", user.image)
                );
            }
            return res.send({
                status: 200,
                message: "User deleted successfully",
            });
        } catch (error) {
            console.log(error);
            return res.status(500).send({
                message: "Error deleting user: " + error.message,
            });
        }
    };
}

module.exports = UserController;
