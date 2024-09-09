const Status = require("../../models/Status");
let msg = "Something went wrong please try again later";

class StatusController {
    static list = async (req, res) => {
        try {
            let statuses = await Status.find().sort({
                created_at: -1,
            });
            return res.render("admin/status", {
                statuses,
            });
        } catch (error) {
            return res.status(500).send(msg);
        }
    };

    static add = async (req, res) => {
        try {
            const insertRecord = Status({
                name: req.body.name,
                type: req.body.type,
            });
            await insertRecord.save();
            return res.send({
                status: 200,
                message: "Status Added successfully",
            });
        } catch (error) {
            console.log(error);
            return res.status(500).send(msg);
        }
    };

    static edit = async (req, res) => {
        try {
            const { editid, type, name } = req.body;
            const status = await Status.findOne({
                _id: editid,
            });
            await Status.findOneAndUpdate(
                {
                    _id: editid,
                },
                {
                    name: name,
                    type: type,
                    updated_at: new Date(),
                }
            );
            return res.send({
                status: 200,
                status,
                message: "Status updated successfully",
            });
        } catch (error) {
            console.log(error);
            return res.status(500).send(msg);
        }
    };

    static delete = async (req, res) => {
        try {
            await Status.findByIdAndDelete(req.params.id);
            return res.send({
                status: 200,
                message: "Status Deleted successfully",
            });
        } catch (error) {
            console.log(error);
            return res.status(500).send(msg);
        }
    };
}

module.exports = StatusController;
