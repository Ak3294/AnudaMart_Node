const Adminauth = require("../../models/Adminauth");
const bcrypt = require("bcrypt");
const multer = require("multer");
const path = require("path");
const root = process.cwd();

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
        cb(null, `${Date.now()}.jpg`);
    },
});

module.exports = AuthController;
