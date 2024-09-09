const Banner = require("../../models/Banner");
const WebSetting = require("../../models/WebSetting");
const RazorpayConfig = require("../../models/RazorpayConfig");
const SmtpConfig = require("../../models/SmtpConfig");
const Status = require("../../models/Status");
const config = require("../../config/createStatus");
const multer = require("multer");
const path = require("path");
const root = process.cwd();
const fs = require("fs");
const imageFilter = require("../../config/imageFilter");

class SettingsController {
    static list = async (req, res) => {
        try {
            const banners = await Banner.findOne();

            return res.render("admin/banner", {
                home_banner_top_url: banners
                    ? banners.home_banner_top.url
                    : " ",
                home_banner_2_url: banners ? banners.home_banner_2.url : " ",
                home_banner_3_url: banners ? banners.home_banner_3.url : " ",
                home_banner_4_url: banners ? banners.home_banner_4.url : " ",
                subscription_banner_url: banners
                    ? banners.subscription_banner.url
                    : " ",

                home_banner_top_image: banners
                    ? banners.home_banner_top.image
                    : " ",
                home_banner_2_image: banners
                    ? banners.home_banner_2.image
                    : " ",
                home_banner_3_image: banners
                    ? banners.home_banner_3.image
                    : " ",
                home_banner_4_image: banners
                    ? banners.home_banner_4.image
                    : " ",
                subscription_banner_image: banners
                    ? banners.subscription_banner.image
                    : " ",

                home_banner_top_title: banners
                    ? banners.home_banner_top.title
                    : " ",
                home_banner_2_title: banners
                    ? banners.home_banner_2.title
                    : " ",
                home_banner_3_title: banners
                    ? banners.home_banner_3.title
                    : " ",
                home_banner_4_title: banners
                    ? banners.home_banner_4.title
                    : " ",
                subscription_banner_title: banners
                    ? banners.subscription_banner.title
                    : " ",
                home_banner_top_description: banners
                    ? banners.home_banner_top.description
                    : " ",
                home_banner_2_description: banners
                    ? banners.home_banner_2.description
                    : " ",
                home_banner_3_description: banners
                    ? banners.home_banner_3.description
                    : " ",
                home_banner_4_description: banners
                    ? banners.home_banner_4.description
                    : " ",
                subscription_banner_description: banners
                    ? banners.subscription_banner.description
                    : " ",
                banners,
            });
        } catch (error) {
            console.log(error);
            return res
                .status(500)
                .send("Error creating banner: " + error.message);
        }
    };

    static addBanner = async (req, res) => {
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

                const data = req.body;
                const files = req.files || {};

                let exist = await Banner.findOne();

                const bannerData = {
                    home_banner_top: {
                        image: files.home_banner_top_image
                            ? files.home_banner_top_image[0].filename
                            : exist
                            ? exist.home_banner_top.image
                            : "", // Retain existing image if not replaced
                        url: data.home_banner_top_url,
                        title: data.home_banner_top_title,
                        description: data.home_banner_top_description.trim(),
                    },
                    home_banner_2: {
                        image: files.home_banner_2_image
                            ? files.home_banner_2_image[0].filename
                            : exist
                            ? exist.home_banner_2.image
                            : "", // Retain existing image if not replaced
                        url: data.home_banner_2_url,
                        title: data.home_banner_2_title,
                        description: data.home_banner_2_description.trim(),
                    },
                    home_banner_3: {
                        image: files.home_banner_3_image
                            ? files.home_banner_3_image[0].filename
                            : exist
                            ? exist.home_banner_3.image
                            : "", // Retain existing image if not replaced
                        url: data.home_banner_3_url,
                        title: data.home_banner_3_title,
                        description: data.home_banner_3_description.trim(),
                    },
                    home_banner_4: {
                        image: files.home_banner_4_image
                            ? files.home_banner_4_image[0].filename
                            : exist
                            ? exist.home_banner_4.image
                            : "", // Retain existing image if not replaced
                        url: data.home_banner_4_url,
                        title: data.home_banner_4_title,
                        description: data.home_banner_4_description.trim(),
                    },
                    subscription_banner: {
                        image: files.subscription_banner_image
                            ? files.subscription_banner_image[0].filename
                            : exist
                            ? exist.subscription_banner.image
                            : "", // Retain existing image if not replaced
                        url: data.subscription_banner_url,
                        title: data.subscription_banner_title,
                        description:
                            data.subscription_banner_description.trim(),
                    },
                };

                if (exist) {
                    // Delete old images only if new images are uploaded
                    if (
                        files.home_banner_top_image &&
                        exist.home_banner_top.image
                    ) {
                        fs.unlink(
                            path.join(
                                root,
                                "/public/dist/banner/",
                                exist.home_banner_top.image
                            ),
                            (err) => {
                                if (err) {
                                    console.error(err);
                                }
                            }
                        );
                    }

                    if (
                        files.home_banner_2_image &&
                        exist.home_banner_2.image
                    ) {
                        fs.unlink(
                            path.join(
                                root,
                                "/public/dist/banner/",
                                exist.home_banner_2.image
                            ),
                            (err) => {
                                if (err) {
                                    console.error(err);
                                }
                            }
                        );
                    }

                    if (
                        files.home_banner_3_image &&
                        exist.home_banner_3.image
                    ) {
                        fs.unlink(
                            path.join(
                                root,
                                "/public/dist/banner/",
                                exist.home_banner_3.image
                            ),
                            (err) => {
                                if (err) {
                                    console.error(err);
                                }
                            }
                        );
                    }

                    if (
                        files.home_banner_4_image &&
                        exist.home_banner_4.image
                    ) {
                        fs.unlink(
                            path.join(
                                root,
                                "/public/dist/banner/",
                                exist.home_banner_4.image
                            ),
                            (err) => {
                                if (err) {
                                    console.error(err);
                                }
                            }
                        );
                    }

                    if (
                        files.subscription_banner_image &&
                        exist.subscription_banner.image
                    ) {
                        fs.unlink(
                            path.join(
                                root,
                                "/public/dist/banner/",
                                exist.subscription_banner.image
                            ),
                            (err) => {
                                if (err) {
                                    console.error(err);
                                }
                            }
                        );
                    }

                    bannerData.updated_at = new Date();
                    await Banner.updateOne({}, bannerData);
                } else {
                    const newBanner = new Banner(bannerData);
                    await newBanner.save();
                }

                return res.send({
                    status: 200,
                    message: "Banner added successfully",
                });
            });
        } catch (error) {
            console.error(error);
            return res.send({
                status: 500,
                message: "Failed to add banner: " + error.message,
            });
        }
    };

    static settings_view = async (req, res) => {
        try {
            const settings = await WebSetting.findOne();

            return res.render("admin/websetting", {
                address: settings ? settings.address : "",
                phone: settings ? settings.phone : "",
                email: settings ? settings.email : "",
                toll_number: settings ? settings.toll_number : "",
                logo: settings ? settings.logo : "",
                copyright: settings ? settings.copyright : "",
                twitter: settings ? settings.twitter : "",
                facebook: settings ? settings.facebook : "",
                instagram: settings ? settings.instagram : "",
            });
        } catch (error) {
            console.log(error);
            return res
                .status(500)
                .send("Error settings_view: " + error.message);
        }
    };

    static webSettings = async (req, res) => {
        try {
            logoUpload(req, res, async function (err) {
                if (req.fileValidationError) {
                    return res.send(req.fileValidationError);
                } else if (err instanceof multer.MulterError) {
                    console.log(err);
                    return res.send(err);
                } else if (err) {
                    console.log(err);
                    return res.send(err);
                }

                const data = req.body;
                let exist = await WebSetting.findOne();

                const insertData = {
                    address: data.address.trim(),
                    phone: data.phone,
                    email: data.email,
                    toll_number: data.toll_number,
                    logo: req.file
                        ? req.file.filename
                        : exist
                        ? exist.logo
                        : "",
                    copyright: data.copyright,
                    twitter: data.twitter,
                    facebook: data.facebook,
                    instagram: data.instagram,
                };

                if (exist) {
                    if (req.file && exist.logo) {
                        fs.unlink(
                            path.join(
                                root,
                                "/public/dist/websetting/",
                                exist.logo
                            ),
                            (err) => {
                                if (err) {
                                    console.error(err);
                                }
                            }
                        );
                    }
                    insertData.updated_at = new Date();
                    await WebSetting.updateOne({}, insertData);
                } else {
                    const newSetting = new WebSetting(insertData);
                    await newSetting.save();
                }

                return res.send({
                    status: 200,
                    message: "Settings updated successfully",
                });
            });
        } catch (error) {
            console.error(error);
            return res.send({
                status: 500,
                message: "Failed to Settings update: " + error.message,
            });
        }
    };

    static smtp_config_view = async (req, res) => {
        try {
            const smtpConfig = await SmtpConfig.findOne();

            return res.render("admin/smtp-config", {
                service: smtpConfig ? smtpConfig.service : "",
                host: smtpConfig ? smtpConfig.host : "",
                port: smtpConfig ? smtpConfig.port : "",
                mail_address: smtpConfig ? smtpConfig.mail_address : "",
                name: smtpConfig ? smtpConfig.name : "",
                username: smtpConfig ? smtpConfig.username : "",
                password: smtpConfig ? smtpConfig.password : "",
                secure: smtpConfig
                    ? smtpConfig.secure === true
                        ? "ssl"
                        : "tsl"
                    : "",
            });
        } catch (error) {
            console.log(error);
            return res
                .status(500)
                .send("Error creating smtpConfig: " + error.message);
        }
    };

    static smtp_config_add = async (req, res) => {
        try {
            const data = req.body;
            let exist = await SmtpConfig.findOne();

            const insertData = {
                service: data.service,
                host: data.host,
                port: data.port,
                mail_address: data.mail_address,
                name: data.name,
                username: data.username,
                password: data.password,
                secure: data.secure === "ssl" ? true : false,
            };

            if (exist) {
                insertData.updated_at = new Date();
                await SmtpConfig.updateOne({}, insertData);
            } else {
                const newConfig = new SmtpConfig(insertData);
                await newConfig.save();
            }

            return res.send({
                status: 200,
                message: "SMTP Config updated successfully",
            });
        } catch (error) {
            console.error(error);
            return res.send({
                status: 500,
                message: "Failed to update SMTP Config: " + error.message,
            });
        }
    };

    static razorpay_config = async (req, res) => {
        try {
            const razorpayconfig = await RazorpayConfig.findOne();
            await config.createRazorpayStatus();
            const activeStatus = await Status.findOne({
                type: "razorpay",
                name: { $regex: new RegExp("^enable$", "i") },
            });

            return res.render("admin/razorpay-config", {
                key_id: razorpayconfig ? razorpayconfig.key_id : "",
                key_secret: razorpayconfig ? razorpayconfig.key_secret : "",
                activeStatus,
                status_id: razorpayconfig ? razorpayconfig.status_id : "",
            });
        } catch (error) {
            console.log(error);
            return res
                .status(500)
                .send("Error razorpay_config: " + error.message);
        }
    };

    static razorpay_config_add = async (req, res) => {
        try {
            const data = req.body;
            let exist = await RazorpayConfig.findOne();

            await config.createRazorpayStatus();
            const activeStatus = await Status.findOne({
                type: "razorpay",
                name: { $regex: new RegExp("^enable$", "i") },
            });
            const inactiveStatus = await Status.findOne({
                type: "razorpay",
                name: { $regex: new RegExp("^disable$", "i") },
            });

            const insertData = {
                key_id: data.key_id,
                key_secret: data.key_secret,
                status_id:
                    data.status_id === "on"
                        ? activeStatus._id
                        : inactiveStatus._id,
            };

            if (exist) {
                insertData.updated_at = new Date();
                await RazorpayConfig.updateOne({}, insertData);
            } else {
                const newSetting = new RazorpayConfig(insertData);
                await newSetting.save();
            }

            return res.send({
                status: 200,
                message: "Razorpay config updated successfully",
            });
        } catch (error) {
            console.error(error);
            return res.send({
                status: 500,
                message: "Failed to Razorpay config update: " + error.message,
            });
        }
    };
}

// Set The Storage Engine
const storage = multer.diskStorage({
    destination: path.join(root, "/public/dist/banner"),
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
}).fields([
    { name: "home_banner_top_image", maxCount: 1 },
    { name: "home_banner_2_image", maxCount: 1 },
    { name: "home_banner_3_image", maxCount: 1 },
    { name: "home_banner_4_image", maxCount: 1 },
    { name: "subscription_banner_image", maxCount: 1 },
]);

const logoStorage = multer.diskStorage({
    destination: path.join(root, "/public/dist/websetting"),
    filename: function (req, file, cb) {
        cb(
            null,
            file.fieldname + "-" + Date.now() + path.extname(file.originalname)
        );
    },
});

const logoUpload = multer({
    storage: logoStorage,
    fileFilter: imageFilter,
}).single("logo");

module.exports = SettingsController;
