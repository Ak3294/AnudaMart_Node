const PayoutReport = require("../../models/PayoutReport");
const Vendor = require("../../models/Vendor");

class PayoutController {
    static list = async (req, res) => {
        const payoutReports = await PayoutReport.find({}).sort({
            createdAt: -1,
        });
        const vendor = await Vendor.findOne({
            user_id: req.session.seller._id,
        });

        const page = parseInt(req.query.page) || 1; // Current page number, default to 1
        const pageSize = parseInt(req.query.pageSize) || 10; // Items per page, default to 10

        const totalItems = payoutReports.length;
        return res.render("seller/payout", {
            payoutReports,
            vendor,
            currentPage: page,
            pageSize,
            totalItems,
        });
    };

    static add = async (req, res) => {
        try {
            const vendor = await Vendor.findOne({
                user_id: req.session.seller._id,
            });

            const insertRecord = PayoutReport({
                amount: req.body.amount,
                department: req.body.department.trim(),
                account_holder_name: vendor.account_holder_name,
                ifsc_code: vendor.ifsc_code,
                bank_name: vendor.bank_name,
                account_no: vendor.account_no,
            });
            await insertRecord.save();
            return res.send({
                status: 200,
                message: "Payout Requested Successfully",
            });
        } catch (error) {
            console.log(error);
            return res.send({
                status: 500,
                message: "Payout Request Failed" + error.message,
            });
        }
    };

    static delete = async (req, res) => {
        try {
            await PayoutReport.findByIdAndDelete(req.params.id);
            return res.send({
                status: 200,
                message: "Request deleted successfully",
            });
        } catch (error) {
            console.log(error);
            return res.status(500).send({
                message: "Error deleting Request: " + error.message,
            });
        }
    };
}

module.exports = PayoutController;
