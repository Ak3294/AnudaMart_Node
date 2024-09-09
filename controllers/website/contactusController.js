const Contactus = require("../../models/Contactus");

class ContactusController {
    static contactus = async (req, res) => {
        try {
            const data = req.body;

            if (!req.body.first_name) {
                return res.status(500).send("Please fill first name");
            } else if (!req.body.last_name) {
                return res.status(500).send("Please fill last name");
            } else if (!req.body.email) {
                return res.status(500).send("Please fill email");
            } else if (!req.body.country) {
                return res.status(500).send("Please fill country");
            }

            const contactus = await Contactus({
                first_name: data.first_name,
                last_name: data.last_name,
                email: data.email,
                phone: data.phone,
                country: data.country,
                subject: data.subject,
                message: data.message,
                terms_conditions: data.terms_conditions,
            });
            await contactus.save();
            return res.send(
                "Thank you for contacting us!! We will get back to you soon."
            );
        } catch (error) {
            console.log(error);
            return res
                .status(500)
                .send("Something went wrong please try again later");
        }
    };

    static get_contactus = async (req, res) => {
        try {
            const contact = await Contactus.find({});
            return res.json({
                message: "Success",
                success: true,
                data: contact,
            });
        } catch (error) {
            console.log(error);
            return res.send("Something went wrong please try again later");
        }
    };
}

module.exports = ContactusController;
