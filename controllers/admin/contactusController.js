const Contactus = require("../../models/Contactus");

class ContactusController {
    static list = async (req, res) => {
        const contactus = await Contactus.find().sort({ createdAt: -1 });
        const page = parseInt(req.query.page) || 1; // Current page number, default to 1
        const pageSize = parseInt(req.query.pageSize) || 10; // Items per page, default to 10

        const totalItems = await Contactus.countDocuments();
        return res.render("admin/contactus", {
            contactus,
            currentPage: page,
            pageSize,
            totalItems,
        });
    };
}

module.exports = ContactusController;
