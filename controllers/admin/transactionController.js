const Transaction = require("../../models/Transaction");
const User = require("../../models/User");

class TransactionController {
    static list = async (req, res) => {
        // Find transactions based on the query
        const transactions = await Transaction.find().populate(
            "user_id status_id order_id"
        );

        const users = await User.find();
        const totalTransactionsCount = await Transaction.countDocuments();

        // Render the view with filtered transactions
        return res.render("admin/transactions", {
            transactions,
            totalTransactionsCount,
            users,
        });
    };
}

module.exports = TransactionController;
