const Brand = require("../../models/Brand");
const Status = require("../../models/Status");
const config = require("../../config/createStatus");

class BrandController {
    static list = async (req, res) => {
        try {
            const brands = await Brand.find()
                .sort({
                    created_at: -1,
                })
                .populate("status_id");
            await config.createBrandStatus();
            const activeStatus = await Status.findOne({
                type: "brand",
                name: { $regex: new RegExp("^active$", "i") },
            });
            const page = parseInt(req.query.page) || 1; // Current page number, default to 1
            const pageSize = parseInt(req.query.pageSize) || 10; // Items per page, default to 10

            const totalItems = await Brand.countDocuments();
            return res.render("admin/brand", {
                brands,
                activeStatus,
                currentPage: page,
                pageSize,
                totalItems,
            });
        } catch (error) {
            return res.status(500).send({
                message: "Error fetching brands: " + error.message,
            });
        }
    };

    static add = async (req, res) => {
        try {
            await config.createBrandStatus();
            // Fetch the active and inactive statuses
            const activeStatus = await Status.findOne({
                type: "brand",
                name: { $regex: new RegExp("^active$", "i") },
            });

            const inactiveStatus = await Status.findOne({
                type: "brand",
                name: { $regex: new RegExp("^inactive$", "i") },
            });
            const insertRecord = new Brand({
                name: req.body.name,
                status_id:
                    req.body.status_id === "on"
                        ? activeStatus._id
                        : inactiveStatus._id,
            });
            await insertRecord.save();
            return res.send({
                status: 200,
                message: "Brand added successfully",
            });
        } catch (error) {
            return res
                .status(500)
                .send({ message: "Error creating brand: " + error.message });
        }
    };
    static edit = async (req, res) => {
        try {
            const brand = await Brand.findOne({
                _id: req.body.editid,
            });

            await config.createBrandStatus();
            const activeStatus = await Status.findOne({
                type: "brand",
                name: { $regex: new RegExp("^active$", "i") },
            });

            const inactiveStatus = await Status.findOne({
                type: "brand",
                name: { $regex: new RegExp("^inactive$", "i") },
            });
            await Brand.findByIdAndUpdate(
                {
                    _id: req.body.editid,
                },
                {
                    name: req.body.name,
                    status_id:
                        req.body.status_id === "on"
                            ? activeStatus._id
                            : inactiveStatus._id,
                    updated_at: new Date(),
                }
            );
            return res.send({
                status: 200,
                message: "Brand updated successfully",
            });
        } catch (error) {
            console.error("Error updating brand: ", error);
            return res
                .status(500)
                .send({ message: "Error updating brand: " + error.message });
        }
    };

    static delete = async (req, res) => {
        try {
            await Brand.findByIdAndDelete(req.params.id);

            return res.send({
                status: 200,
                message: "Brand deleted successfully",
            });
        } catch (error) {
            return res
                .status(500)
                .send("Error deleting brand: " + error.message);
        }
    };
}

module.exports = BrandController;
