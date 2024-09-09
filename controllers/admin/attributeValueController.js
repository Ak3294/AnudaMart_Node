const AttributeValue = require("../../models/AttributeValue");
const AttributeSets = require("../../models/AttributeSets");
let msg = "Something went wrong please try again later";

class AttributeValueController {
    static list = async (req, res) => {
        try {
            const page = parseInt(req.query.page) || 1; // Current page number, default to 1
            const pageSize = parseInt(req.query.pageSize) || 10; // Items per page, default to 10

            const totalItems = await AttributeValue.countDocuments(); // Total number of products
            let attributes_values = await AttributeValue.find()
                .sort({
                    created_at: -1,
                })
                .populate("attribute_sets_id");
            let attributes = await AttributeSets.find()
                .sort({
                    created_at: -1,
                })
                .populate("category_id");
            return res.render("admin/attribute-values", {
                attributes_values,
                attributes,
                currentPage: page,
                pageSize,
                totalItems,
            });
        } catch (error) {
            return res
                .status(500)
                .send("Error fetching attribute values: " + error.message);
        }
    };

    static add = async (req, res) => {
        try {
            const insertRecord = AttributeValue({
                attribute_sets_id: req.body.attribute_sets_id
                    ? req.body.attribute_sets_id
                    : null,
                value: req.body.value,
            });
            await insertRecord.save();
            return res.send({
                status: 200,
                message: "AttributeValues Added successfully",
            });
        } catch (error) {
            console.log(error);
            return res
                .status(500)
                .send("Error creating attribute values: " + error.message);
        }
    };

    static edit = async (req, res) => {
        try {
            const attributes = await AttributeValue.findOne({
                _id: req.body.editid,
            });
            await AttributeValue.findOneAndUpdate(
                {
                    _id: req.body.editid,
                },
                {
                    attribute_sets_id: req.body.attribute_sets_id
                        ? req.body.attribute_sets_id
                        : null,
                    value: req.body.value,
                    updated_at: new Date(),
                }
            );
            return res.send({
                status: 200,
                attributes,
                message: "AttributeValues updated successfully",
            });
        } catch (error) {
            console.log(error);
            return res
                .status(500)
                .send("Error updating attribute values: " + error.message);
        }
    };

    static delete = async (req, res) => {
        try {
            await AttributeValue.findByIdAndDelete(req.params.id);
            return res.send({
                status: 200,
                message: "AttributeValues Deleted successfully",
            });
        } catch (error) {
            console.log(error);
            return res
                .status(500)
                .send("Error deleting attribute values: " + error.message);
        }
    };
}

module.exports = AttributeValueController;
