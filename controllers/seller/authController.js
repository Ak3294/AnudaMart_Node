const User = require("../../models/User");
const bcrypt = require("bcrypt");
const multer = require("multer");
const path = require("path");
const root = process.cwd();
const fs = require("fs");
const imageFilter = require("../../config/imageFilter");

class AuthController {
    static loginGET = async (req, res) => {
        return res.render("seller/signin");
    };

    static loginPOST = async (req, res) => {
        const email = req.body.email;
        const password = req.body.password;
        if (!email || !password)
            return res.send("Something went wrong please try again later");
        const seller = await User.findOne({
            email: email,
            user_type: "v",
        });
        if (!seller) return res.send("Account not found");
        const validPassword = await bcrypt.compare(password, seller.password);
        if (!validPassword) return res.status(500).send("Invalid Password");
        req.session.email = seller.email;
        req.session.password = seller.password;
        req.session.seller = seller;
        // Set the session path to the desired dashboard
        req.session.path = "/seller/dashboard";
        return res.send(req.session.path);
    };

    static changepasswordGET = async (req, res) => {
        return res.render("seller/change-password");
    };

    static changepasswordPOST = async (req, res) => {
        try {
            const { oldpassword, newpassword, confirmpassword } = req.body;
            if (!oldpassword || !newpassword || !confirmpassword)
                return res.send({
                    success: false,
                    message: "Please fill all fields.",
                });
            if (newpassword !== confirmpassword)
                return res.send({
                    success: false,
                    message: "New Password & Confirm Password do not match.",
                });
            const user = await User.findOne({
                email: req.session.email,
            });
            if (!user)
                return res.send({
                    success: false,
                    message: "User not found.",
                });
            const validPassword = await bcrypt.compare(
                oldpassword,
                user.password
            );
            if (!validPassword)
                return res.send({
                    success: false,
                    message: "Invalid Password",
                });
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(newpassword, salt);
            await User.updateOne(
                { email: req.session.email },
                { password: hashedPassword }
            );
            req.session.password = hashedPassword;
            return res.send({
                success: true,
                status: 200,
                message: "Password changed successfully.",
            });
        } catch (error) {
            return res.send({
                success: false,
                status: 500,
                message: "Something went wrong please try again later",
            });
        }
    };

    static profileGET = async (req, res) => {
        const record = await User.findOne({
            _id: req.session.seller,
        });
        return res.render("seller/seller-profile", {
            record: {
                first_name: record.first_name,
                last_name: record.last_name,
                image: record.image,
            },
        });
    };

    static profileUpdate = async (req, res) => {
        try {
            upload(req, res, async function (err) {
                const seller_profile = await User.findOne({
                    _id: req.session.seller,
                });

                await User.findOneAndUpdate(
                    {
                        _id: req.session.seller,
                    },
                    {
                        image: req.file
                            ? req.file.filename
                            : seller_profile.image,
                        first_name: req.body.first_name,
                        last_name: req.body.last_name,
                        updated_at: Date.now(),
                    }
                );

                if (seller_profile.image) {
                    fs.unlink(
                        path.join(
                            root,
                            "/public/dist/profile/",
                            seller_profile.image
                        ),
                        (err) => {
                            if (err) {
                                console.log(err);
                            }
                        }
                    );
                }
                await seller_profile.save();
                return res.send({
                    status: 200,
                    message:
                        "Profile updated successfully. Please login again.",
                });
            });
        } catch (error) {
            return res.send({
                success: false,
                status: 500,
                message: "Something went wrong please try again later",
            });
        }
    };

    static logout = async (req, res) => {
        try {
            req.session.destroy();
            return res.send({
                message: "Logged out successfully.",
            });
        } catch (error) {
            return res.send("Something went wrong please try again later");
        }
    };
}

// Set The Storage Engine
const storage = multer.diskStorage({
    destination: path.join(root, "/public/dist/profile"),
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
    fileFilter: imageFilter,
}).single("image");

module.exports = AuthController;
