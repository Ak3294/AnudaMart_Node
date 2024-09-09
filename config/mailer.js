const nodemailer = require("nodemailer");
require("dotenv").config();
const SmtpConfig = require("../models/SmtpConfig");

const sendEmail = async (subject, body, html) => {
    const smtpconfig = await SmtpConfig.findOne();
    const pass = smtpconfig.password;

    return new Promise((resolve, reject) => {
        const transporter = nodemailer.createTransport({
            service: smtpconfig.service,
            host: smtpconfig.host,
            port: smtpconfig.port,
            secure: smtpconfig.secure, // true for 465, false for other ports
            auth: {
                user: smtpconfig.mail_address,
                pass: pass,
            },
        });
        const email = body.email;
        const mailOptions = {
            from: smtpconfig.mail_address,
            to: email,
            subject: subject,
            html: html,
        };

        transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
                console.log(error);
                resolve(false);
            } else {
                console.log("Email sent: " + info.response);
                resolve(true);
            }
        });
    });
};

module.exports = sendEmail;
