const AttributeSets = require("../../models/AttributeSets");
const AttributeValue = require("../../models/AttributeValue");
const Category = require("../../models/Category");

class AttributeSetsController {
    static list = async (req, res) => {
        try {
            let attributes = await AttributeSets.find()
                .sort({
                    created_at: -1,
                })
                .populate("category_id");

            // Fetch the attribute values for each attribute set
            const attributesWithValues = await Promise.all(
                attributes.map(async (attribute) => {
                    const attributeValues = await AttributeValue.find({
                        attribute_sets_id: attribute._id,
                    });
                    return {
                        ...attribute._doc,
                        values: attributeValues,
                    };
                })
            );

            let categories = await Category.find({
                parent_id: null,
            }).sort({
                created_at: -1,
            });
            const page = parseInt(req.query.page) || 1; // Current page number, default to 1
            const pageSize = parseInt(req.query.pageSize) || 10; // Items per page, default to 10

            const totalItems = await AttributeSets.countDocuments();
            return res.render("admin/attribute-sets", {
                attributes: attributesWithValues,
                categories,
                currentPage: page,
                pageSize,
                totalItems,
            });
        } catch (error) {
            console.log(error);
            return res.status(500).send({
                message: "Error creating attribute sets: " + error.message,
            });
        }
    };

    static add = async (req, res) => {
        try {
            let categoryIds = Array.isArray(req.body.category_id)
                ? req.body.category_id
                : [req.body.category_id];
            const insertRecord = AttributeSets({
                title: req.body.title,
                category_id: categoryIds,
            });
            await insertRecord.save();
            return res.send({
                status: 200,
                message: "AttributeSet Added successfully",
            });
        } catch (error) {
            console.log(error);
            return res.status(500).send({
                message: "Error creating attribute sets: " + error.message,
            });
        }
    };

    static edit = async (req, res) => {
        try {
            const attributes = await AttributeSets.findOne({
                _id: req.body.editid,
            });
            await AttributeSets.findOneAndUpdate(
                {
                    _id: req.body.editid,
                },
                {
                    title: req.body.title,
                    category_id: req.body.category_id,
                    updated_at: new Date(),
                }
            );
            return res.send({
                status: 200,
                attributes,
                message: "AttributeSet updated successfully",
            });
        } catch (error) {
            console.log(error);
            return res.status(500).send({
                message: "Error updating attribute sets: " + error.message,
            });
        }
    };

    static delete = async (req, res) => {
        try {
            await AttributeSets.findByIdAndDelete(req.params.id);
            return res.send({
                status: 200,
                message: "AttributeSet Deleted successfully",
            });
        } catch (error) {
            console.log(error);
            return res.status(500).send({
                message: "Error deleting attribute sets: " + error.message,
            });
        }
    };
}

module.exports = AttributeSetsController;
