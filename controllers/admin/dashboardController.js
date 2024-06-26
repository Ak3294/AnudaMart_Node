class DashboardController {
    static dashboard = async (req, res) => {
        return res.render("admin/index");
    };
}

module.exports = DashboardController;
