const User = require("../../models/User");
const Vendor = require("../../models/Vendor");
const config = require("../../config/createStatus");
const bcrypt = require("bcrypt");
const multer = require("multer");
const path = require("path");
const root = process.cwd();
const imageFilter = require("../../config/imageFilter");
require("dotenv").config;
const Status = require("../../models/Status");

class VendorController {
    static list = async (req, res) => {
        try {
            let statuses = await Status.find({
                type: "user",
            }).sort({
                created_at: -1,
            });

            const users = await User.find({ user_type: "v" }).populate(
                "status_id"
            );
            return res.render("admin/vendor", {
                statuses,
                users,
            });
        } catch (error) {
            return res
                .status(500)
                .send("Error fetching vendors: " + error.message);
        }
    };

    static add = async (req, res) => {
        uploadUser(req, res, async (err) => {
            if (err) {
                return res.status(400).send({ message: err });
            }

            const { file, body } = req;
            const image = file ? file.filename : null;
            const {
                first_name,
                last_name,
                email,
                password,
                confirmpassword: confirm_password,
            } = body;

            if (!image) {
                return res.status(400).send({ message: "Image is required" });
            }

            if (password !== confirm_password) {
                return res.status(401).send({
                    message: "Password and Confirm Password do not match",
                });
            }

            try {
                const saltRounds = 10;
                const salt = await bcrypt.genSalt(saltRounds);
                const hashedpassword = await bcrypt.hash(password, salt);

                const vendorExists = await User.findOne({
                    email: email,
                    user_type: "v",
                });

                if (vendorExists) {
                    return res.status(401).send({
                        message: "User already exists",
                    });
                }

                await config.createUserStatus();
                const activeStatus = await Status.findOne({
                    type: "user",
                    name: { $regex: new RegExp("^active$", "i") },
                });

                const vendor = new User({
                    image: image,
                    user_type: "v",
                    first_name: first_name,
                    last_name: last_name,
                    email: email,
                    password: hashedpassword,
                    status_id: activeStatus._id,
                });
                await vendor.save();
                return res.send({
                    message: "Vendor registered successfully",
                    status: true,
                });
            } catch (error) {
                console.log(error);
                return res.status(500).send({
                    message: "Something went wrong, please try again later",
                    error: error.message,
                });
            }
        });
    };

    static datepicker = async (req, res) => {
        try {
            const { startDate, endDate } = req.query;

            // Convert query string dates to Date objects
            const start = new Date(startDate);
            const end = new Date(endDate);
            end.setHours(23, 59, 59, 999); // Include the entire end date

            // Format created_at to MM/DD/YYYY
            const formattedUsers = users.map((user) => ({
                ...user.toObject(),
                created_at: new Date(user.created_at).toLocaleDateString(
                    "en-US"
                ),
            }));

            return res.json({ users: formattedUsers }); // Send JSON response
        } catch (error) {
            return res
                .status(500)
                .send("Error fetching vendors: " + error.message);
        }
    };

    // POST route to handle the edit operation
    static edit = async (req, res) => {
        try {
            let id = req.params.id;
            let statuses = await Status.find().sort({ created_at: -1 });

            const user = await User.findOne({ _id: id });
            if (!user) {
                return res.status(404).send("User not found");
            }

            let vendors = await Vendor.findOne({ user_id: user._id });
            if (!vendors) {
                vendors = new Vendor({ user_id: user._id });
            }
            res.render("admin/edit-vendor", { vendors, statuses, user });
        } catch (error) {
            console.error("Error fetching user:", error);
            return res
                .status(500)
                .send("Error fetching user details", error.message);
        }
    };

    static update = async (req, res) => {
        try {
            editupload(req, res, async (err) => {
                if (err) {
                    return res.status(500).send({
                        message: "Error uploading images",
                        error: err.message,
                    });
                }

                const editid = req.body.editid;
                if (!editid) {
                    return res
                        .status(400)
                        .send({ message: "editid is required" });
                }

                // Find user by editid
                const user = await User.findOne({ _id: editid });
                if (!user) {
                    return res.status(404).send("User not found");
                }

                // Handle user image update
                let userImage = user.image;
                if (req.files.image) {
                    userImage = req.files.image[0].filename;
                }

                // Update user details
                await User.findByIdAndUpdate(
                    { _id: editid },
                    {
                        image: userImage,
                        first_name: req.body.first_name,
                        last_name: req.body.last_name,
                        email: req.body.email,
                        phone: req.body.phone,
                        dob: req.body.dob,
                        address: req.body.address,
                        address2: req.body.address2,
                        pincode: req.body.pincode,
                        additional_info: req.body.additional_info,
                        status_id: req.body.status_id,
                        updated_at: new Date(),
                    },
                    { upsert: true, new: true }
                );

                // Next handle vendor document uploads
                let vendor = await Vendor.findOne({ user_id: user._id });
                if (!vendor) {
                    vendor = new Vendor({ user_id: user._id });
                }

                const {
                    aadhar_front_photo,
                    aadhar_back_photo,
                    pan_front_photo,
                } = req.files || {};

                const vendorFiles = {
                    aadhar_front_photo: aadhar_front_photo
                        ? aadhar_front_photo[0].filename
                        : vendor.aadhar_front_photo,
                    aadhar_back_photo: aadhar_back_photo
                        ? aadhar_back_photo[0].filename
                        : vendor.aadhar_back_photo,
                    pan_front_photo: pan_front_photo
                        ? pan_front_photo[0].filename
                        : vendor.pan_front_photo,
                };

                // Update vendor details
                const vendorDetails = {
                    aadhar_no: req.body.aadhar_no,
                    pan_no: req.body.pan_no,
                    gst_no: req.body.gst_no,
                    account_holder_name: req.body.account_holder_name,
                    ifsc_code: req.body.ifsc_code,
                    bank_name: req.body.bank_name,
                    account_no: req.body.account_no,
                    ...vendorFiles,
                    updated_at: new Date(),
                };

                await Vendor.findOneAndUpdate(
                    { user_id: user._id },
                    vendorDetails,
                    { upsert: true, new: true }
                );

                res.status(200).send({
                    status: 200,
                    message: "Vendor updated successfully",
                });
            });
        } catch (error) {
            console.error("Error updating vendor:", error);
            return res.status(500).send({
                message: "Error updating vendor",
                error: error.message,
            });
        }
    };

    static status_ban = async (req, res) => {
        try {
            const { userId } = req.body;
            const bannedStatus = await Status.findOne({
                type: "user",
                name: { $regex: new RegExp("^banned$", "i") },
            });
            await config.createUserStatus();
            await User.findOneAndUpdate(
                { _id: userId },
                { $set: { status_id: bannedStatus._id } } // upsert option to create if not exists
            );

            // Update user's status_id
            await User.findByIdAndUpdate(userId, {
                status_id: bannedStatus._id,
            });

            // Send a success response
            res.status(200).json({
                status: 200,
                message: "Status Change Successfully!",
            });
        } catch (error) {
            console.error("Error banning user:", error);
            return res.status(500).send({
                status: 500,
                message: "Error ban user",
                error: error.message,
            });
        }
    };

    static status_change = async (req, res) => {
        try {
            const { userId, status } = req.body;

            const findStatus = await Status.findOne({
                name: status,
                type: "user",
            });

            await config.createUserStatus();

            if (findStatus) {
                await User.findOneAndUpdate(
                    { _id: findStatus._id },
                    { $set: { status_id: findStatus._id } } // Return the updated document
                );

                // Update user's status_id
                await User.findByIdAndUpdate(userId, {
                    status_id: findStatus._id,
                });
            }

            // Send a success response
            res.status(200).send({
                status: 200,
                message: "Status Change Successfully!",
            });
        } catch (error) {
            console.error("Error banning user:", error);
            return res.status(500).send({
                status: 500,
                message: "Error Status Change",
                error: error.message,
            });
        }
    };

    static delete = async (req, res) => {
        try {
            await User.findByIdAndDelete(req.params.id);
            return res.send({
                success: true,
                status: 200,
                message: "Vendor deleted successfully",
            });
        } catch (error) {
            console.log(error);
            return res
                .status(500)
                .send({ message: "Error deleting Vendor: " + error.message });
        }
    };
}

//#region Multer Configurations for Add vendor
// Storage configuration for user images
const userStorage = multer.diskStorage({
    destination: path.join(root, "/public/dist/users"),
    filename: function (req, file, cb) {
        cb(
            null,
            file.fieldname + "_" + Date.now() + path.extname(file.originalname)
        );
    },
});

// Init upload for users
const uploadUser = multer({
    storage: userStorage,
    limits: { fileSize: 1000000 },
}).single("image");
//#endregion

//#region Multer Configurations for Edit vendor
// Storage configuration for vendor images
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        let uploadPath = path.join(root, "/public/dist/users");
        if (
            file.fieldname === "aadhar_front_photo" ||
            file.fieldname === "aadhar_back_photo" ||
            file.fieldname === "pan_front_photo"
        ) {
            uploadPath = path.join(root, "/public/dist/vendor");
        }
        cb(null, uploadPath);
    },
    filename: function (req, file, cb) {
        cb(
            null,
            file.fieldname + "_" + Date.now() + path.extname(file.originalname)
        );
    },
});

const editupload = multer({
    storage: storage,
    fileFilter: imageFilter,
}).fields([
    { name: "image", maxCount: 1 },
    { name: "aadhar_front_photo", maxCount: 1 },
    { name: "aadhar_back_photo", maxCount: 1 },
    { name: "pan_front_photo", maxCount: 1 },
]);

module.exports = VendorController;
