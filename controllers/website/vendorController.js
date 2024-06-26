const User = require("../../models/User");
const Vendor = require("../../models/Vendor");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const multer = require("multer");
const path = require("path");
const root = process.cwd();
const imageFilter = require("../../config/imageFilter");

// Set The Storage Engine
const storage = multer.diskStorage({
    destination: path.join(root, "/public/dist/vendor"),
    filename: function (req, file, cb) {
        cb(null, `${Date.now()}.jpg`);
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
                    name,
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
                    aadhar_no,
                    pan_no,
                    gst_no,
                    account_holder_name,
                    ifsc_code,
                    bank_name,
                    account_no,
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
                const userExists = await User.findOne({ email });
                if (userExists) {
                    return res.status(401).send("user already exists");
                }

                // Create and save the new user
                const newUser = new User({
                    user_type: "v",
                    name: name,
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

                // Create and save the new vendor
                const newVendor = new Vendor({
                    user_id: newUser._id,
                    aadhar_no,
                    aadhar_front_photo:
                        req.files.aadhar_front_photo[0].filename,
                    aadhar_back_photo: req.files.aadhar_back_photo[0].filename,
                    pan_front_photo: req.files.pan_front_photo[0].filename,
                    pan_no,
                    gst_no,
                    signature: req.files.signature[0].filename,
                    account_holder_name,
                    ifsc_code,
                    bank_name,
                    account_no,
                });
                await newVendor.save();
                return res.send("Vendor Registration successful");
            });
        } catch (error) {
            console.log(error);
            return res
                .status(500)
                .send("Something went wrong please try again later");
        }
    };

    static update_profile = async (req, res) => {
        let msg = "Something went wrong please try again later";
        try {
            upload(req, res, async function (err) {
                var token = req.body.token;
                const payload = jwt.decode(token, process.env.TOKEN_SECRET);
                const vendor = await Vendor.findOne({
                    user_id: payload.id,
                });
                if (!vendor) {
                    return res.status(401).send("Vendor not found");
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
            return res.status(401).send(msg);
        }
    };
}

module.exports = VendorController;
