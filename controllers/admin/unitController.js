const Unit = require("../../models/Unit");

class UnitController {
    static list = async (req, res) => {
        try {
            let units = await Unit.find().sort({ created_at: -1 });
            const page = parseInt(req.query.page) || 1; // Current page number, default to 1
            const pageSize = parseInt(req.query.pageSize) || 10; // Items per page, default to 10
            const totalItems = await Unit.countDocuments();
            return res.render("admin/unit", {
                units,
                currentPage: page,
                pageSize,
                totalItems,
            });
        } catch (error) {
            console.log(error);
            return res.status(500).send({
                message: "Error retrieving units: " + error.message,
            });
        }
    };

    static add = async (req, res) => {
        try {
            const insertRecord = new Unit({
                default: req.body.default === "on" ? "true" : "false",
                name: req.body.name,
                code: req.body.code,
                code_name: req.body.code_name,
                symbol: req.body.symbol,
                symbol_international: req.body.symbol_international,
            });
            await insertRecord.save();
            return res.send({
                status: 200,
                message: "Unit added successfully",
            });
        } catch (error) {
            console.error(error);
            return res.status(500).send({
                message: "Error add unit: " + error.message,
            });
        }
    };

    static edit = async (req, res) => {
        try {
            const {
                editid,
                edit_default,
                edit_name,
                edit_code,
                edit_code_name,
                edit_symbol,
                edit_symbol_international,
            } = req.body;

            const unit = await Unit.findOne({
                _id: editid,
            });
            await Unit.findOneAndUpdate(
                {
                    _id: editid,
                },
                {
                    default: edit_default === "on" ? "true" : "false",
                    name: edit_name,
                    code: edit_code,
                    code_name: edit_code_name,
                    symbol: edit_symbol,
                    symbol_international: edit_symbol_international,
                    updated_at: new Date(),
                }
            );
            return res.send({
                status: 200,
                message: "Units updated successfully",
            });
        } catch (error) {
            console.log(error);
            return res.status(500).send({
                message: "Error update units: " + error.message,
            });
        }
    };

    static delete = async (req, res) => {
        try {
            const { id } = req.params;
            await Unit.findByIdAndDelete(id);
            return res.send({
                status: 200,
                message: "Unit Deleted successfully",
            });
        } catch (error) {
            console.log(error);
            return res.status(500).send({
                message: "Error delete unit: " + error.message,
            });
        }
    };
}

module.exports = UnitController;
