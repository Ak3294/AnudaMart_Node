const User = require("../../models/User");
const Vendor = require("../../models/Vendor");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const multer = require("multer");
const path = require("path");
const root = process.cwd();
require("dotenv").config();
const baseURL = process.env.BaseURL;
const fs = require("fs");
const defaultImage = baseURL + "/assets/images/default/user-dummy-img.jpg";
const imageFilter = require("../../config/imageFilter");

// Set The Storage Engine
const storage = multer.diskStorage({
    destination: path.join(root, "/public/dist/vendor"),
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
}).fields([
    { name: "aadhar_front_photo", maxCount: 1 },
    { name: "aadhar_back_photo", maxCount: 1 },
    { name: "pan_front_photo", maxCount: 1 },
    { name: "signature", maxCount: 1 },
]);

class VendorController {
    static register = async (req, res) => {
        try {
            upload(req, res, async function (err) {
                if (req.fileValidationError) {
                    return res.send(req.fileValidationError);
                } else if (!req.files.aadhar_front_photo) {
                    return res.send({
                        error: true,
                        message: "Please upload aadhar front photo",
                    });
                } else if (!req.files.aadhar_back_photo) {
                    return res.send({
                        error: true,
                        message: "Please upload aadhar back photo",
                    });
                } else if (!req.files.pan_front_photo) {
                    return res.send({
                        error: true,
                        message: "Please upload pan front photo",
                    });
                } else if (!req.files.signature) {
                    return res.send({
                        error: true,
                        message: "Please upload signature",
                    });
                } else if (err instanceof multer.MulterError) {
                    console.log(err);
                    return res.send(err);
                } else if (err) {
                    console.log(err);
                    return res.send(err);
                }

                const {
                    first_name,
                    last_name,
                    email,
                    phone,
                    password,
                    dob,
                    address,
                    address2,
                    pincode,
                    city,
                    additional_info,
                } = req.body;

                var mobileRegex = new RegExp("^[0-9]{10}$");
                var emailRegex = new RegExp(
                    "^[a-zA-Z0-9+_.-]+@[a-zA-Z0-9.-]+$"
                );

                if (!emailRegex.test(email))
                    return res.send("Invalid email address");
                if (!mobileRegex.test(phone))
                    return res.send("Invalid phone number");

                const salt = await bcrypt.genSalt(
                    Number(process.env.SALT_ROUNDS)
                );
                const hashedpassword = await bcrypt.hash(password, salt);
                const userExists = await User.findOne({
                    email: email,
                    user_type: "v",
                });
                if (userExists) {
                    return res.status(401).send({
                        message: "User already exists",
                        status: false,
                        success: false,
                    });
                }

                // Create and save the new user
                const newUser = new User({
                    user_type: "v",
                    first_name: first_name,
                    last_name: last_name,
                    email: email,
                    dob: dob,
                    phone: phone,
                    address: address,
                    address2: address2,
                    pincode: pincode,
                    city: city,
                    additional_info: additional_info,
                    password: hashedpassword,
                });
                await newUser.save();
                return res.send({
                    message: "Vendor registered successfully",
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

    static update_profile = async (req, res) => {
        try {
            upload(req, res, async function (err) {
                var token = req.body.token;
                const payload = jwt.decode(token, process.env.TOKEN_SECRET);
                const vendor = await Vendor.findOne({
                    user_id: payload.id,
                });
                if (!vendor) {
                    return res.status(401).send({
                        message: "Vendor not found",
                        status: false,
                        success: false,
                    });
                }

                if (req.fileValidationError) {
                    return res.send(req.fileValidationError);
                } else if (err instanceof multer.MulterError) {
                    console.log(err);
                    return res.send(err);
                } else if (err) {
                    console.log(err);
                    return res.send(err);
                }

                let data = {
                    aadhar_no: req.body.aadhar_no,
                    aadhar_front_photo:
                        req.files.aadhar_front_photo[0].filename,
                    aadhar_back_photo: req.files.aadhar_back_photo[0].filename,
                    pan_front_photo: req.files.pan_front_photo[0].filename,
                    pan_no: req.body.pan_no,
                    gst_no: req.body.gst_no,
                    signature: req.files.signature[0].filename,
                    account_holder_name: req.body.account_holder_name,
                    ifsc_code: req.body.ifsc_code,
                    bank_name: req.body.bank_name,
                    account_no: req.body.account_no,
                };

                let vendorData = {};
                for (let i in data) {
                    if (data[i] != "") {
                        vendorData[i] = data[i]; // json object
                    }
                }
                const profile = await Vendor.findOne({ _id: vendor._id });
                await Vendor.findByIdAndUpdate(
                    {
                        _id: profile._id,
                    },
                    { $set: vendorData }
                );
                let updatedData = await profile.save();
                return res.status(201).send({
                    message: "profile Update Successfully",
                    status: true,
                    success: true,
                    data: updatedData,
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

    static vendor_profile = async (req, res) => {
        try {
            var token = req.body.token;
            let mediaUrl = baseURL + "/dist/vendor/";

            const payload = jwt.decode(token, process.env.TOKEN_SECRET);
            const vendor = await Vendor.findOne({
                user_id: payload.id,
            }).populate("user_id");
            if (!vendor) {
                return res.status(401).send({
                    message: "Vendor not found",
                    status: false,
                    success: false,
                });
            }

            // set default image if necessary
            if (vendor.user_id.image && vendor.user_id.image.trim() !== "") {
                const imagePath = path.join(
                    __dirname,
                    "../../public/dist/users/",
                    vendor.user_id.image
                );
                try {
                    await fs.promises.access(imagePath, fs.constants.F_OK);
                    vendor.user_id.image =
                        mediaUrl + vendor.user_id.image.trim();
                } catch (error) {
                    vendor.user_id.image = defaultImage;
                }
            } else {
                vendor.user_id.image = defaultImage;
            }

            // handle vendor images aadhar_front_photo
            if (
                vendor.aadhar_front_photo &&
                vendor.aadhar_front_photo.trim() !== ""
            ) {
                const imagePath = path.join(
                    __dirname,
                    "../../public/dist/vendor/",
                    vendor.aadhar_front_photo
                );
                try {
                    if (fs.existsSync(imagePath)) {
                        vendor.aadhar_front_photo =
                            mediaUrl + vendor.aadhar_front_photo.trim();
                    } else {
                        vendor.aadhar_front_photo = null;
                    }
                } catch (error) {
                    vendor.aadhar_front_photo = null;
                }
            } else {
                vendor.aadhar_front_photo = null;
            }

            // handle vendor images aadhar_back_photo
            if (
                vendor.aadhar_back_photo &&
                vendor.aadhar_back_photo.trim() !== ""
            ) {
                const imagePath = path.join(
                    __dirname,
                    "../../public/dist/vendor/",
                    vendor.aadhar_back_photo
                );
                try {
                    if (fs.existsSync(imagePath)) {
                        vendor.aadhar_back_photo =
                            mediaUrl + vendor.aadhar_back_photo.trim();
                    } else {
                        vendor.aadhar_back_photo = null;
                    }
                } catch (error) {
                    vendor.aadhar_back_photo = null;
                }
            }

            // handle vendor images pan_front_photo
            if (
                vendor.pan_front_photo &&
                vendor.pan_front_photo.trim() !== ""
            ) {
                const imagePath = path.join(
                    __dirname,
                    "../../public/dist/vendor/",
                    vendor.pan_front_photo
                );
                try {
                    if (fs.existsSync(imagePath)) {
                        vendor.pan_front_photo =
                            mediaUrl + vendor.pan_front_photo.trim();
                    } else {
                        vendor.pan_front_photo = null;
                    }
                } catch (error) {
                    vendor.pan_front_photo = null;
                }
            }

            return res.status(201).send({
                message: "Vendor profile",
                status: true,
                success: true,
                data: vendor,
                mediaUrl,
            });
        } catch (error) {
            console.log(error);
            return res.status(500).send({
                message: "Something went wrong please try again later",
                error: error.message,
            });
        }
    };
}

module.exports = VendorController;
