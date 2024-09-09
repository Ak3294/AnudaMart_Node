const Support = require("../../models/Support");
const multer = require("multer");
const path = require("path");
const root = process.cwd();
const imageFilter = require("../../config/imageFilter");

class SupportController {
    static list = async (req, res) => {
        let supports = await Support.find().sort({ created_at: -1 });
        return res.render("seller/support", {
            supports,
        });
    };

    static add = async (req, res) => {
        try {
            upload(req, res, async function (err) {
                if (err) {
                    return res.status(400).send({
                        message: "Error uploading files: " + err.message,
                    });
                }
                if (req.fileValidationError) {
                    return res.status(400).send({
                        message: req.fileValidationError,
                    });
                }

                const data = req.body;
                const files = req.files || {};

                const insertRecord = new Support({
                    subject: data.subject,
                    priority: data.priority,
                    description: data.description.replace(
                        /<\/?[^>]+(>|$)/g,
                        ""
                    ),
                    gallery_images: Array.isArray(files.gallery_images)
                        ? files.gallery_images.map((f) => f.filename)
                        : files.gallery_images
                        ? [files.gallery_images[0].filename]
                        : [],
                });
                await insertRecord.save();
                return res.send({
                    status: 200,
                    message: "Enquiry Send Successfully!",
                });
            });
        } catch (error) {
            console.log(error);
            return res.status(500).send({
                message: "Error creating Support Enquiry: " + error.message,
            });
        }
    };

    static delete = async (req, res) => {
        try {
            await Support.findByIdAndDelete(req.params.id);
            return res.send({
                success: true,
                status: 200,
                message: "Enquiry deleted successfully",
            });
        } catch (error) {
            console.log(error);
            return res
                .status(500)
                .send({ message: "Error deleting Enquiry: " + error.message });
        }
    };
}

const storage = multer.diskStorage({
    destination: path.join(root, "/public/dist/support"),
    filename: function (req, file, cb) {
        cb(
            null,
            file.fieldname + "-" + Date.now() + path.extname(file.originalname)
        );
    },
});

const fileFilter = function (req, file, cb) {
    const imageFields = ["gallery_images"];
    if (imageFields.includes(file.fieldname)) {
        imageFilter(req, file, cb);
    }
};

// Init Upload
const upload = multer({
    storage: storage,
    // limits: {
    //     fileSize: 5000000
    // },
    fileFilter: fileFilter,
}).fields([{ name: "gallery_images", maxCount: 10 }]);

module.exports = SupportController;
