const Adminauth = require("../../models/Adminauth");
const bcrypt = require("bcrypt");
const multer = require("multer");
const path = require("path");
const root = process.cwd();
const fs = require("fs");
const imageFilter = require("../../config/imageFilter");

class AuthController {
    static loginGET = async (req, res) => {
        return res.render("admin/signin");
    };

    static loginPOST = async (req, res) => {
        const username = req.body.username;
        const password = req.body.password;
        if (!username || !password)
            return res.send("Something went wrong please try again later");
        const user = await Adminauth.findOne({
            username: username,
        });
        if (!user) return res.send("Account not found");
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) return res.status(500).send("Invalid Password");
        req.session.username = user.username;
        req.session.password = user.password;
        req.session.type = user.type;
        req.session.user = user;
        if (req.session.path) {
            return res.send(req.session.path);
        } else {
            return res.send("success");
        }
    };

    static changepasswordGET = async (req, res) => {
        return res.render("admin/change-password");
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
            const user = await Adminauth.findOne({
                username: req.session.username,
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
            await Adminauth.updateOne(
                { username: req.session.username },
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
        const record = await Adminauth.findOne({
            _id: req.session.user,
        });
        return res.render("admin/admin-profile", {
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
                const admin_profile = await Adminauth.findOne({
                    _id: req.session.user,
                });

                await Adminauth.findOneAndUpdate(
                    {
                        _id: req.session.user,
                    },
                    {
                        image: req.file
                            ? req.file.filename
                            : admin_profile.image,
                        first_name: req.body.first_name,
                        last_name: req.body.last_name,
                        updated_at: Date.now(),
                    }
                );

                if (admin_profile.image) {
                    fs.unlink(
                        path.join(
                            root,
                            "/public/dist/profile/",
                            admin_profile.image
                        ),
                        (err) => {
                            if (err) {
                                console.log(err);
                            }
                        }
                    );
                }
                await admin_profile.save();
                return res.send({
                    success: true,
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
                success: true,
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
