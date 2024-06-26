const User = require("../../models/User");
// const Coupon = require("../../models/Coupon");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const multer = require("multer");
const path = require("path");
const root = process.cwd();
const moment = require("moment");
const baseURL = process.env.URL;
const imageFilter = require("../../config/imageFilter");

// Set The Storage Engine
const storage = multer.diskStorage({
    destination: path.join(root, "/public/dist/users"),
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
}).single("image");

class webauthController {
    static register = async (req, res) => {
        try {
            const name = req.body.name;
            const email = req.body.email;
            const password = req.body.password;
            const confirm_password = req.body.confirm_password;

            if (password !== confirm_password)
                return res.status(401).send("Password does not match");

            const salt = await bcrypt.genSalt(Number(process.env.SALT_ROUNDS));
            const hashedpassword = await bcrypt.hash(password, salt);
            const hashedconfirm_password = await bcrypt.hash(
                confirm_password,
                salt
            );

            const userExists = await User.findOne({ email: email });
            if (userExists) {
                return res.status(401).send("user already exists");
            }
            const user = await User({
                // image: req.file.filename,
                user_type: "u",
                name: name,
                email: email,
                password: hashedpassword,
                confirm_password: hashedconfirm_password,
            });
            await user.save();
            return res.send("User Registration successful");
        } catch (error) {
            console.log(error);
            return res
                .status(500)
                .send("Something went wrong please try again later");
        }
    };

    static loginPOST = async (req, res) => {
        try {
            const email = req.body.email;
            const password = req.body.password;
            if (!email)
                return res.send("Please provide an email address to login");
            if (!password)
                return res.send("Please provide a password to login");
            const user = await User.findOne({
                email: email,
            });
            if (!user) return res.send("Account not found");
            const validPassword = await bcrypt.compare(password, user.password);
            if (!validPassword) return res.status(500).send("Invalid Password");

            var d = new Date();
            d.setMonth(d.getMonth() + 3);
            var e = d.getTime();
            const token = jwt.sign(
                { id: user._id, expiry_time: e },
                process.env.TOKEN_SECRET
            );
            const tokenExpiryTime = moment(parseInt(token.updated_at)).add(
                30,
                "minutes"
            );
            const currentTime = moment(Date.now());
            if (currentTime > tokenExpiryTime) {
                return res.status(401).send("Token Expired");
            } else {
                return res.status(200).send({
                    token,
                    user_type: user.user_type,
                });
            }
        } catch (error) {
            console.log(error);
            return res
                .status(500)
                .send("Something went wrong please try again later");
        }
    };

    static change_password = async (req, res) => {
        try {
            const { authorization } = req.headers;
            if (authorization == null)
                return res.status(401).send("please check authorization");
            const token = authorization.replace("Bearer ", "");
            const payload = jwt.decode(token, process.env.TOKEN_SECRET);
            if (payload == null)
                return res.status(401).send("token is required");
            const user = await User.findById(payload.id);
            if (!user) return res.status(401).send("user not found");
            const password = req.body.password;
            if (!password) {
                return res.status(401).send("Please enter a password");
            }
            const salt = await bcrypt.genSalt(Number(process.env.SALT_ROUNDS));
            const hashedPassword = await bcrypt.hash(req.body.password, salt);

            await User.findOneAndUpdate(
                { _id: user._id },
                { password: hashedPassword }
            );
            return res.status(200).send("password changed successfully");
        } catch (error) {
            console.log(error);
            return res.status(500).send("something went wrong");
        }
    };

    static reset_password = async (req, res) => {
        try {
            const { email, old_password, new_password } = req.body;
            if (!email) return res.status(401).send("Email is required");
            if (!old_password)
                return res.status(401).send("Old Password is required");
            if (!new_password)
                return res.status(401).send("New Password is required");

            const user = await User.findOne({ email: email });
            if (!user) return res.status(401).send("User not found");

            const validPassword = await bcrypt.compare(
                old_password,
                user.password
            );
            if (!validPassword) return res.status(500).send("Invalid Password");

            const salt = await bcrypt.genSalt(Number(process.env.SALT_ROUNDS));
            const hashedPassword = await bcrypt.hash(new_password, salt);

            await User.findOneAndUpdate(
                { _id: user._id },
                { password: hashedPassword }
            );
            return res.status(200).send("password changed successfully");
        } catch (error) {
            console.log(error);
            return res
                .status(500)
                .send("Something went wrong please try again later");
        }
    };

    static user_profile = async (req, res) => {
        let msg = "Something went wrong please try again later";
        try {
            var token = req.body.token;
            let mediaUrl = baseURL + "/dist/users/";

            const payload = jwt.decode(token, process.env.TOKEN_SECRET);
            const user = await User.findById(payload.id);
            if (!user) return res.status(401).send("User not found");

            res.send({
                user: {
                    user_type: user.user_type,
                    name: user.name,
                    first_name: user.first_name,
                    last_name: user.last_name,
                    email: user.email,
                    // phone: user.phone,
                    dob: user.dob,
                    address: user.address,
                    address2: user.address2,
                    city: user.city,
                    pincode: user.pincode,
                    additional_info: user.additional_info,
                    image: user.image
                        ? mediaUrl + user.image
                        : mediaUrl + "default.jpg",
                },
                mediaUrl,
            });
        } catch (error) {
            console.log(error);
            return res.status(401).send(msg);
        }
    };

    static update_profile = async (req, res) => {
        let msg = "Something went wrong please try again later";
        try {
            upload(req, res, async function (err) {
                var token = req.body.token;
                const payload = jwt.decode(token, process.env.TOKEN_SECRET);
                const user = await User.findById(payload.id);
                if (!user) return res.status(401).send("User not found");

                let data = {
                    image: req.file ? req.file.filename : "",
                    name: req.body.name,
                    first_name: req.body.first_name,
                    last_name: req.body.last_name,
                    email: req.body.email,
                    // phone: req.body.phone,
                    address: req.body.address,
                    address2: req.body.address2,
                    city: req.body.city,
                    pincode: req.body.pincode,
                    additional_info: req.body.additional_info,
                };
                let userData = {};
                for (let i in data) {
                    if (data[i] != "") {
                        userData[i] = data[i]; // json object
                    }
                }

                const profile = await User.findOne({
                    _id: user._id,
                });
                await User.findOneAndUpdate(
                    {
                        _id: profile._id,
                    },
                    { $set: userData }
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

    static logout = async (req, res) => {
        try {
            req.session.destroy();
            return res.send("success");
        } catch (error) {
            return res.send("Something went wrong please try again later");
        }
    };

    static switch_account = async (req, res) => {
        try {
            var token = req.body.token;
            const { switch_account } = req.body;
            const payload = jwt.decode(token, process.env.TOKEN_SECRET);
            const user = await User.findById(payload.id);
            if (!user) return res.status(401).send("User not found");

            if (user.user_type === switch_account) {
                return res.send("You are already in this account");
            }
            user.user_type = switch_account;
            await user.save();
            return res.send("Account switched successfully");
        } catch (error) {
            console.log(error);
            return res
                .status(401)
                .send("Something went wrong please try again later");
        }
    };

    // static coupon_verify = async (req, res) => {
    //     let msg = "Something went wrong please try again later";
    //     try {
    //         var token = req.body.token;
    //         var coupon_code = req.body.coupon_code;
    //         const payload = jwt.decode(token, process.env.TOKEN_SECRET);
    //         const user = await User.findById(payload.id);
    //         if (!user) return res.status(401).send("User not found");

    //         let findData = { coupon_code: coupon_code, isActive: true };

    //         let findRec = await Coupon.findOne(findData);
    //         if (!findRec) return res.status(401).send("Invalid coupon");

    //         if (findRec.is_used == true)
    //             return res.status(401).send("Coupon already used");
    //         if (new Date() > findRec.expiry_date)
    //             return res.status(401).send("Coupon has expired");

    //         return res.send({
    //             message: "Coupon verified successfully",
    //             success: true,
    //             data: {
    //                 coupon_code: coupon_code,
    //                 discount: findRec.discount,
    //                 valid_start_date: findRec.valid_start_date,
    //                 expiry_date: findRec.expiry_date,
    //             },
    //         });
    //     } catch (error) {
    //         console.log(error);
    //         return res.status(401).send(msg);
    //     }
    // };
}

module.exports = webauthController;
