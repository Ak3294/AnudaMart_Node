const User = require("../../models/User");

class UserController {
    static list = async (req, res) => {
        try {
            const users = await User.find();
            return res.render("admin/user", { users });
        } catch (error) {
            return res
                .status(500)
                .send("Error fetching brands: " + error.message);
        }
    };
}

module.exports = UserController;
