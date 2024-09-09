const pdfFilter = function (req, file, cb) {
    if (!file.originalname.match(/\.(pdf|PDF)$/)) {
        req.fileValidationError =
            "Only PDF files are allowed in PDF Specification!";
        return cb(
            new Error("Only PDF files are allowed in PDF Specification!"),
            false
        );
    }
    cb(null, true);
};
module.exports = pdfFilter;
