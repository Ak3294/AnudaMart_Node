const baseURL = process.env.URL;
const Category = require("../../models/Category");

class WebsiteController {
    static category = async (req, res) => {
        let msg = "Something went wrong please try again later";
        let mediaUrl = baseURL + "/dist/category/";
        try {
            const { parent_id } = req.params;
            // If parentCategoryId is not provided or null, get all categories  // else parentCategoryId is provided, get subcategories based on parent_id
            if (!parent_id) {
                const categories = await Category.find({ parent_id: null });
                return res.json({
                    message: "Success",
                    success: true,
                    data: categories,
                    mediaUrl,
                });
            } else {
                const categories = await Category.find({ parent_id });
                return res.json({
                    message: "Success",
                    success: true,
                    data: categories,
                    mediaUrl,
                });
            }
        } catch (error) {
            console.log(error);
            return res.status(401).send(msg);
        }
    };
}

module.exports = WebsiteController;
