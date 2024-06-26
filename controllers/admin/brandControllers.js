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
}

module.exports = BrandController;
