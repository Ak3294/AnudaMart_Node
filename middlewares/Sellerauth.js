const User = require("../models/User");

const SellerLoggedIn = async (req, res, next) => {
    try {
        if (req.session && req.session.seller) {
            res.locals.seller = req.session.seller;
        } else {
            res.locals.seller = null;
        }
        next();
    } catch (error) {
        console.error("Error in SessionData middleware:", error);
        next(error);
    }
};

const NotLoggedIn = async (req, res, next) => {
    req.session.path = req.originalUrl;
    const email = req.session.email;
    const password = req.session.password;
    if (!email || !password) return res.redirect("/seller/login");
    const seller = await User.findOne({
        email: email,
        user_type: "v",
    });
    if (!seller) return res.redirect("/seller/login");
    const validPassword = seller.password == password ? true : false;
    if (!validPassword) return res.redirect("/seller/login");
    next();
};

module.exports = {
    SellerLoggedIn,
    NotLoggedIn,
};
