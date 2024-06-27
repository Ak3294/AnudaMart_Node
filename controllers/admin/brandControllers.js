const Brand = require("../../models/Brand");

class BrandController {
    static list = async (req, res) => {
        try {
            const brands = await Brand.find();
            return res.render("admin/brand", { brands });
        } catch (error) {
            return res
                .status(500)
                .send("Error fetching brands: " + error.message);
        }
    };

    static create = async (req, res) => {
        try {
            const { name, status } = req.body;
            const newBrand = new Brand({ name, status });
            await newBrand.save();
            return res.send({
                success: true,
                status: 200,
                message: "Brand added successfully",
            });
        } catch (error) {
            return res
                .status(500)
                .send("Error creating brand: " + error.message);
        }
    };

    // Controller for updating a brand
    static update = async (req, res) => {
        try {
            const { id } = req.params;
            const { name, status } = req.body;

            await Brand.findByIdAndUpdate(id, { name, status });
            res.status(200).send("Brand updated successfully");
        } catch (error) {
            console.error("Error updating brand:", error.message); // Log error
            res.status(500).send("Error updating brand: " + error.message);
        }
    };

    static delete = async (req, res) => {
        try {
            const { id } = req.params;
            const deletedBrand = await Brand.findByIdAndDelete(id);
            if (!deletedBrand) {
                return res.status(404).send("Brand not found");
            }
            res.status(200).json({
                deletedId: deletedBrand._id,
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
