const User = require("../../models/User");
const Coupon = require("../../models/Coupon");
const Status = require("../../models/Status");
const Rating = require("../../models/Rating");
const Wishlist = require("../../models/Wishlist");
const Subscription = require("../../models/Subscription");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const multer = require("multer");
const path = require("path");
const root = process.cwd();
const mongoose = require("mongoose");
const moment = require("moment");
require("dotenv").config();
const baseURL = process.env.BaseURL;
const fs = require("fs");
const defaultImage = baseURL + "/assets/images/default/user-dummy-img.jpg";
const imageFilter = require("../../config/imageFilter");
const config = require("../../config/createStatus");
const sendEmail = require("../../config/mailer");
const CryptoJS = require("crypto-js");

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

// Set The Storage Engine
const storage1 = multer.diskStorage({
    destination: path.join(root, "/public/dist/ratings"),
    filename: function (req, file, cb) {
        cb(
            null,
            file.fieldname + "_" + Date.now() + path.extname(file.originalname)
        );
    },
});

// Init Upload
const uploadR = multer({
    storage: storage1,
    limits: {
        fileSize: 5000000,
    },
    fileFilter: imageFilter,
}).single("image");

class webauthController {
    static register = async (req, res) => {
        try {
            const first_name = req.body.first_name;
            const last_name = req.body.last_name;
            const email = req.body.email;
            const password = req.body.password;
            const confirm_password = req.body.confirm_password;

            if (password !== confirm_password) {
                return res.status(401).send({
                    message: "Password and Confirm Password do not match",
                });
            }

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
            let status = await Status.findOne({
                name: { $regex: new RegExp("^active$", "i") },
                type: { $regex: new RegExp("^user$", "i") },
            });

            const user = new User({
                user_type: "u",
                first_name: first_name,
                last_name: last_name,
                email: email,
                password: hashedpassword,
                confirm_password: hashedconfirm_password,
                status: status._id,
            });
            await user.save();

            // Read HTML template for email
            const HTML_TEMPLATE = fs.readFileSync(
                path.join(__dirname, "../../views/mail-templates/welcome.html"),
                "utf8"
            );

            // Replace placeholder in HTML template with actual data
            const html = HTML_TEMPLATE.replace("{{first_name}}", first_name);

            // Define subject and body for the email
            const subject = `Hi ${first_name}, Your registration was successful!`;
            const body = { email, first_name };

            // Send email
            await sendEmail(subject, body, html);

            return res.send({
                message: "User registered successfully",
                status: true,
                success: true,
            });
        } catch (error) {
            console.log(error);
            return res.status(500).send({
                message: "Something went wrong please try again later",
                error: error.message,
            });
        }
    };

    static loginPOST = async (req, res) => {
        try {
            const email = req.body.email;
            const password = req.body.password;
            if (!email)
                return res.send({
                    message: "Please provide an email to login",
                });
            if (!password)
                return res.send({
                    message: "Please provide a password to login",
                });
            const user = await User.findOne({
                email: email,
            });
            if (!user)
                return res.send({
                    message: "User not found",
                });
            const validPassword = await bcrypt.compare(password, user.password);
            if (!validPassword)
                return res.status(500).send({
                    message: "Invalid password",
                });

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
                return res.status(401).send({
                    message: "Token expired",
                    token: null,
                });
            } else {
                return res.status(200).send({
                    token,
                    user_type: user.user_type,
                    first_name: user.first_name,
                    last_name: user.last_name,
                    email: user.email,
                });
            }
        } catch (error) {
            console.log(error);
            return res.status(500).send({
                message: "Something went wrong please try again later",
                error: error.message,
            });
        }
    };

    static change_password = async (req, res) => {
        try {
            const { password, new_password } = req.body;
            const { authorization } = req.headers;
            if (authorization == null)
                return res.status(401).send({
                    message: "please check authorization",
                });
            const token = authorization.replace("Bearer ", "");
            const payload = jwt.decode(token, process.env.TOKEN_SECRET);
            if (payload == null)
                return res.status(401).send({
                    message: "token is required",
                });
            const user = await User.findById(payload.id);
            if (!user)
                return res.status(401).send({
                    message: "User not found",
                });

            if (!password) {
                return res.status(401).send({
                    message: "Old Password is required",
                });
            }

            if (!new_password)
                return res.status(401).send({
                    message: "New Password is required",
                });

            const validPassword = await bcrypt.compare(password, user.password);
            if (!validPassword)
                return res.status(500).send({
                    message: "Invalid Old Password",
                });

            const salt = await bcrypt.genSalt(Number(process.env.SALT_ROUNDS));
            const hashedPassword = await bcrypt.hash(new_password, salt);

            await User.findOneAndUpdate(
                { _id: user._id },
                { password: hashedPassword }
            );
            return res.status(200).send({
                message: "password changed successfully",
            });
        } catch (error) {
            console.log(error);
            return res.status(500).send({
                message: "Something went wrong please try again later",
                error: error.message,
            });
        }
    };

    static forgot_password = async (req, res) => {
        const encrypt = (text) => {
            return CryptoJS.enc.Base64.stringify(CryptoJS.enc.Utf8.parse(text));
        };
        try {
            const { url, email } = req.body;
            if (!email) {
                return res.status(400).send({ message: "Email is required" });
            }

            const user = await User.findOne({ email });

            if (!url) {
                return res.status(404).send({ message: "Url not found" });
            }

            // Generate a token containing the email information
            const emailToken = encrypt(email);

            // Create the reset password URL
            const resetPasswordUrl = `${url}?email=${encodeURIComponent(
                emailToken
            )}`;
            if (user) {
                const HTML_TEMPLATE = fs.readFileSync(
                    path.join(
                        __dirname,
                        "../../views/mail-templates/forgot-password.html"
                    ),
                    "utf8"
                );
                const first_name = user.first_name;
                const html = HTML_TEMPLATE.replace(
                    "{{reset_link}}",
                    resetPasswordUrl
                );
                const body = { email, first_name };
                const subject = `Hi ${body.first_name}, Reset Your Password!`;
                await sendEmail(subject, body, html);
            }

            return res.status(200).send({
                Token: user ? emailToken : "",
                message: user
                    ? "mail Sent Successfully, Please Check Your Mail!"
                    : "Email is Not Exists!",
            });
        } catch (error) {
            console.log(error);
            return res.status(500).send({
                message: "Something went wrong, please try again later",
                error: error.message,
            });
        }
    };

    static reset_password = async (req, res) => {
        const decrypt = (data) => {
            return CryptoJS.enc.Base64.parse(data).toString(CryptoJS.enc.Utf8);
        };
        try {
            const { email_token, new_password } = req.body;
            if (!email_token) {
                return res.status(400).send({ message: "Token is required" });
            }

            if (!new_password) {
                return res
                    .status(400)
                    .send({ message: "New Password is required" });
            }

            // Decode the token to get the email
            const decodedEmail = decrypt(email_token);

            // Find the user by email
            const user = await User.findOne({ email: decodedEmail });
            if (!user) {
                return res.status(404).send({ message: "User not found" });
            }

            // Hash the new password
            const salt = await bcrypt.genSalt(Number(process.env.SALT_ROUNDS));
            const hashedPassword = await bcrypt.hash(new_password, salt);

            // Update the user's password in the database
            await User.findOneAndUpdate(
                { _id: user._id },
                { password: hashedPassword }
            );

            return res
                .status(200)
                .send({ message: "Password has been reset successfully" });
        } catch (error) {
            console.log(error);
            return res.status(500).send({
                message: "Something went wrong, please try again later",
                error: error.message,
            });
        }
    };

    static user_profile = async (req, res) => {
        try {
            var token = req.body.token;
            let mediaUrl = baseURL + "/dist/users/";

            const payload = jwt.decode(token, process.env.TOKEN_SECRET);
            const user = await User.findById(payload.id);
            if (!user)
                return res.status(401).send({
                    message: "User not found",
                    status: false,
                    success: false,
                });

            // set default image if necessary
            if (user.image && user.image.trim() !== "") {
                const imagePath = path.join(
                    __dirname,
                    "../../public/dist/users/",
                    user.image
                );
                try {
                    await fs.promises.access(imagePath, fs.constants.F_OK);
                    user.image = mediaUrl + user.image.trim();
                } catch (error) {
                    user.image = defaultImage;
                }
            } else {
                user.image = defaultImage;
            }

            res.send({
                user: {
                    user_type: user.user_type,
                    first_name: user.first_name,
                    last_name: user.last_name,
                    email: user.email,
                    phone: user.phone,
                    dob: user.dob,
                    address: user.address,
                    address2: user.address2,
                    city: user.city,
                    pincode: user.pincode,
                    additional_info: user.additional_info,
                    image: user.image,
                },
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

    static update_profile = async (req, res) => {
        try {
            upload(req, res, async function (err) {
                var token = req.body.token;
                const payload = jwt.decode(token, process.env.TOKEN_SECRET);
                const user = await User.findById(payload.id);
                if (!user)
                    return res.status(401).send({
                        message: "User not found",
                        status: false,
                        success: false,
                    });

                let data = {
                    image: req.file ? req.file.filename : "",
                    first_name: req.body.first_name,
                    last_name: req.body.last_name,
                    email: req.body.email,
                    phone: req.body.phone,
                    dob: req.body.dob,
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
            return res.status(500).send({
                message: "Something went wrong please try again later",
                error: error.message,
            });
        }
    };

    static logout = async (req, res) => {
        try {
            req.session.destroy();
            return res.send({
                message: "logged out successfully",
            });
        } catch (error) {
            return res.status(500).send({
                message: "Something went wrong please try again later",
                error: error.message,
            });
        }
    };

    static switch_account = async (req, res) => {
        try {
            var token = req.body.token;
            const { switch_account } = req.body;
            const payload = jwt.decode(token, process.env.TOKEN_SECRET);
            const user = await User.findById(payload.id);
            if (!user)
                return res.status(401).send({
                    message: "User not found",
                });

            if (user.user_type === switch_account) {
                return res.send({
                    message: "You are already on this account",
                });
            }
            await User.findOneAndUpdate(
                { _id: user._id },
                { switch_account: switch_account }
            );

            return res.send({
                message: "Account switched successfully",
                success: true,
            });
        } catch (error) {
            console.log(error);
            return res.status(500).send({
                message: "Something went wrong please try again later",
                error: error.message,
            });
        }
    };

    static coupon_verify = async (req, res) => {
        try {
            var token = req.body.token;
            var coupon_code = req.body.coupon_code;
            const payload = jwt.decode(token, process.env.TOKEN_SECRET);
            const user = await User.findById(payload.id);
            if (!user)
                return res.status(401).send({
                    message: "User not found",
                    status: false,
                    success: false,
                });

            let findData = {
                coupon_code: coupon_code,
                date_range: { $exists: true, $ne: null },
            };
            let findRec = await Coupon.findOne(findData);
            if (!findRec)
                return res.status(401).send({ message: "Invalid Coupon!" });

            if (findRec.is_applied === true)
                return res.status(401).send({
                    message: "Coupon already applied",
                });

            // check coupon expiry date
            if (findRec.date_range) {
                const currentDate = new Date();
                const [startDateString, endDateString] =
                    findRec.date_range.split(" - ");

                const parseDate = (dateString) => {
                    const [datePart, timePart, period] = dateString.split(" ");
                    const [day, month, year] = datePart.split("/");
                    const [hour, minute] = timePart.split(":");
                    let hours = parseInt(hour, 10);
                    if (period === "PM" && hours !== 12) {
                        hours += 12;
                    }
                    if (period === "AM" && hours === 12) {
                        hours = 0;
                    }
                    return new Date(
                        `${year}-${month}-${day}T${hours
                            .toString()
                            .padStart(2, "0")}:${minute}:00Z`
                    );
                };

                const startDate = parseDate(startDateString);
                const endDate = parseDate(endDateString);

                if (currentDate >= startDate && currentDate <= endDate) {
                    return res.send({
                        message: "Coupon verified successfully",
                        success: true,
                        data: {
                            coupon_code: coupon_code,
                            type: findRec.type,
                            discount: findRec.discount,
                            valid_start_date: findRec.valid_start_date,
                            expiry_date: findRec.expiry_date,
                        },
                    });
                } else {
                    return res.status(401).send({
                        message: "Coupon expired",
                    });
                }
            }
            return res.send({
                message: "Coupon verified successfully",
                success: true,
                data: {
                    coupon_code: coupon_code,
                    discount: findRec.discount,
                    date_range: findRec.date_range,
                },
            });
        } catch (error) {
            console.log(error);
            return res.status(500).send({
                message: "Something went wrong please try again later",
                error: error.message,
            });
        }
    };

    static product_rating = async (req, res) => {
        try {
            uploadR(req, res, async function (err) {
                var token = req.body.token;
                const payload = jwt.decode(token, process.env.TOKEN_SECRET);
                const user = await User.findById(payload.id);
                if (!user)
                    return res.status(401).send({
                        message: "User not found",
                        status: false,
                        success: false,
                    });

                await config.createRatingStatus();
                let status = await Status.findOne({
                    name: { $regex: new RegExp("^show$", "i") },
                    type: { $regex: new RegExp("^rating$", "i") },
                });

                // validation
                if (!req.body.product_id) {
                    return res.status(401).send({
                        message: "Product id is required",
                    });
                }

                let data = {
                    product_id: req.body.product_id,
                    user_id: user._id,
                    rating: req.body.rating,
                    comment: req.body.comment,
                    image: req.file ? req.file.filename : "",
                    status_id: status._id,
                };

                let ratingData = {};
                for (let i in data) {
                    if (data[i] != "") {
                        ratingData[i] = data[i]; // json object
                    }
                }
                const rating = await Rating(ratingData);
                await rating.save();
                return res.status(201).send({
                    message: "Product Rating Successfully",
                    status: true,
                    success: true,
                    data: rating,
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

    static get_product_ratings = async (req, res) => {
        try {
            const product_id = req.query.product_id;
            let mediaUrl = baseURL + "/dist/ratings/";

            const ratings = await Rating.find({
                product_id: product_id,
            })
                .populate({
                    path: "user_id",
                    model: "User",
                    select: "user_type first_name last_name email phone address address2",
                })
                .populate({ path: "status_id", model: "Status" });

            // set default image if necessary
            if (ratings && ratings.length > 0) {
                ratings.forEach((rating) => {
                    if (rating.image && rating.image.trim() !== "") {
                        const imagePath = path.join(
                            __dirname,
                            "../../public/dist/ratings/",
                            rating.image
                        );
                        try {
                            fs.accessSync(imagePath, fs.constants.F_OK);
                            rating.image = mediaUrl + rating.image.trim();
                        } catch (error) {
                            rating.image = defaultImage;
                        }
                    } else {
                        rating.image = defaultImage;
                    }
                });
            }

            if (!ratings || ratings.length === 0) {
                return res.status(401).send({
                    message: "No ratings found",
                });
            }

            return res.send({
                message: "Ratings fetched successfully",
                success: true,
                data: ratings,
            });
        } catch (error) {
            console.log(error);
            return res.status(500).send({
                message: "Something went wrong, please try again later",
                error: error.message,
            });
        }
    };

    static product_wishlist = async (req, res) => {
        try {
            var token = req.body.token;
            const product_id = req.body.product_id;
            var is_wishlist =
                req.body.is_wishlist && req.body.is_wishlist == true
                    ? Boolean(req.body.is_wishlist)
                    : false;

            const payload = jwt.decode(token, process.env.TOKEN_SECRET);
            if (!payload || !payload.id) {
                return res.status(401).send({
                    message: "Invalid token",
                    status: false,
                    success: false,
                });
            }

            const user = await User.findById(payload.id);
            if (!user) {
                return res.status(401).send({
                    message: "User not found",
                    status: false,
                    success: false,
                });
            }

            let findData = {
                product_id: product_id,
                user_id: user._id,
            };

            let findRec = await Wishlist.findOne(findData);

            if (is_wishlist) {
                if (findRec) {
                    findRec.is_wishlist = is_wishlist;
                    await findRec.save();
                } else {
                    let saveObj = { ...findData, is_wishlist: is_wishlist };
                    await Wishlist.create(saveObj);
                }
            } else {
                if (findRec) {
                    findRec.is_wishlist = false;
                    await findRec.save();
                }
            }

            let returnObj = {
                message: "Product added in wishlist successfully",
                data: {
                    product_id: product_id,
                    user_id: user._id,
                    is_wishlist: is_wishlist,
                },
            };

            return res.send(returnObj);
        } catch (error) {
            console.log(error);
            return res.status(500).send({
                message: "Something went wrong, please try again later",
                error: error.message,
            });
        }
    };

    static get_wishlist = async (req, res) => {
        try {
            const { token, product_id } = req.body;
            const payload = jwt.decode(token, process.env.TOKEN_SECRET);
            const user = await User.findById(payload.id);

            if (!user) {
                return res.status(401).send({
                    message: "User not found",
                    status: false,
                    success: false,
                });
            }

            let wishlistQuery = { user_id: user._id };
            if (product_id) {
                wishlistQuery.product_id = product_id;
            }

            const wishlist = await Wishlist.find(wishlistQuery)
                .populate({
                    path: "product_id",
                    populate: { path: "category_id", model: "Category" },
                })
                .populate({
                    path: "product_id",
                    populate: { path: "brand_id", model: "Brand" },
                })
                .populate({
                    path: "product_id",
                    populate: { path: "unit_id", model: "Unit" },
                })
                .populate({
                    path: "product_id",
                    populate: {
                        path: "vendor_id",
                        model: "User",
                        select: "first_name last_name email phone",
                    },
                })
                .populate({
                    path: "product_id",
                    populate: { path: "status_id", model: "Status" },
                });

            if (!wishlist || wishlist.length === 0) {
                return res.send({
                    data: [],
                });
            }

            // Process each product in the wishlist
            let mediaUrl = baseURL + "/dist/product/";
            let newProducts = await Promise.all(
                wishlist.map(async (item) => {
                    if (
                        item.product_id &&
                        item.product_id.thumbnail &&
                        item.product_id.thumbnail.trim() !== ""
                    ) {
                        const imagePath = path.join(
                            __dirname,
                            "../../public/dist/product/",
                            item.product_id.thumbnail
                        );
                        try {
                            fs.accessSync(imagePath, fs.constants.F_OK);
                            item.product_id.thumbnail =
                                mediaUrl + item.product_id.thumbnail.trim();
                        } catch (error) {
                            item.product_id.thumbnail = defaultImage;
                        }
                    } else {
                        item.product_id.thumbnail = defaultImage;
                    }

                    // Convert product_id to a plain JavaScript object
                    let productObj = item.product_id.toObject();

                    // Calculate special_price for the product
                    let special_price = 0;
                    if (productObj.special_discount_type === "flat") {
                        special_price =
                            productObj.unit_price - productObj.special_discount;
                    } else if (
                        productObj.special_discount_type === "percentage"
                    ) {
                        const discountAmount =
                            (productObj.unit_price *
                                productObj.special_discount) /
                            100;
                        special_price = productObj.unit_price - discountAmount;
                    }

                    // Add special_price to the plain object
                    productObj.special_price = special_price.toFixed(2);

                    // Calculate average rating
                    const ratings = await Rating.aggregate([
                        {
                            $match: {
                                product_id: mongoose.Types.ObjectId(
                                    item.product_id._id
                                ),
                            },
                        },
                        { $group: { _id: "$rating", count: { $sum: 1 } } },
                    ]);

                    const ratingsMap = ratings.reduce(
                        (acc, rating) => {
                            acc[rating._id] = rating.count;
                            return acc;
                        },
                        { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
                    );

                    const totalRatings = Object.keys(ratingsMap).reduce(
                        (acc, key) => acc + ratingsMap[key],
                        0
                    );
                    const totalScore = Object.keys(ratingsMap).reduce(
                        (acc, key) => acc + ratingsMap[key] * key,
                        0
                    );
                    const averageRating = totalRatings
                        ? totalScore / totalRatings
                        : 0;

                    productObj.average_rating = averageRating.toFixed(2);
                    return productObj;
                })
            );

            // Group the products by wishlist
            let wishlistRes = wishlist.map((item) => {
                const data = item.toObject();
                return {
                    ...data,
                    product_id: newProducts.filter(
                        (product) =>
                            product._id.toString() ===
                            data.product_id._id.toString()
                    ),
                };
            });

            return res.status(200).send({
                message: "Wishlist fetched successfully",
                success: true,
                data: wishlistRes,
            });
        } catch (error) {
            console.error("Error fetching wishlist:", error);
            return res.status(500).send({
                message: "An error occurred while fetching wishlist",
                success: false,
                error: error.message,
            });
        }
    };

    static delete_wishlist = async (req, res) => {
        try {
            const { id } = req.query;
            const deletedWishlist = await Wishlist.findByIdAndDelete(id);

            if (!deletedWishlist) {
                return res.status(404).json({ message: "Id not found" });
            }

            return res.send({
                success: true,
                status: 200,
                message: "Wishlist deleted successfully",
            });
        } catch (error) {
            console.error("Error fetching data:", error);
            res.send({
                success: false,
                status: 500,
                message: "Error fetching data" + error.message,
            });
        }
    };

    static subscription = async (req, res) => {
        try {
            const { email } = req.body;
            if (!email) {
                return res.status(400).send({
                    success: false,
                    message: "Email is required!",
                });
            }

            // Check if the email already exists in the database
            const existingSubscription = await Subscription.findOne({
                email: email,
            });

            if (existingSubscription) {
                return res.status(409).send({
                    success: false,
                    message: "Email already Exists!",
                });
            }

            // Create a new subscription
            const newSubscription = new Subscription({ email: email });
            await newSubscription.save();

            return res.status(201).send({
                success: true,
                message: "Subscription successful!",
            });
        } catch (error) {
            console.error("Error subscribing:", error);
            return res.status(500).send({
                success: false,
                message: "Error subscribing: " + error.message,
            });
        }
    };
}

module.exports = webauthController;
