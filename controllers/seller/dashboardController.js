class DashboardController {
    static dashboard = async (req, res) => {
        return res.render("seller/index");
    };
}

module.exports = DashboardController;
