const Faq = require("../../models/Faq");

class FaqController {
    static list = async (req, res) => {
        try {
            const faq = await Faq.find();
            return res.render("admin/faq", { faq });
        } catch (error) {
            console.log("Error fetching faq: ", error);
            return res.send({
                message: "Error fetching faq: " + error.message,
            });
        }
    };
    static add = async (req, res) => {
        try {
            const { faqData } = req.body;
            for (let faq of faqData) {
                if (faq._id) {
                    await Faq.findByIdAndUpdate(faq._id, {
                        title: faq.title,
                        description: faq.description,
                    });
                } else {
                    const newFaq = new Faq({
                        title: faq.title,
                        description: faq.description,
                    });
                    await newFaq.save();
                }
            }
            return res.send({
                status: 200,
                message: "FAQ added successfully",
            });
        } catch (error) {
            console.error("Error adding FAQ: ", error);
            return res
                .status(500)
                .send({ message: "Error adding FAQ: " + error.message });
        }
    };

    static delete = async (req, res) => {
        try {
            const { id } = req.params;
            await Faq.findByIdAndDelete(id);
            return res.send({
                status: 200,
                message: "FAQ deleted successfully",
            });
        } catch (error) {
            console.log(error);
            return res
                .status(500)
                .send("Something went wrong please try again later");
        }
    };
}

module.exports = FaqController;
