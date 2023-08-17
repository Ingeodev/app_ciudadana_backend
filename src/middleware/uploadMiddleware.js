const multer = require('multer');

const storage = multer.memoryStorage();

const imageFilter = (req, file, cb) => {
    const allowedMimetypes = ['image/png', 'image/jpg', 'image/jpeg'];
    try {
        if (allowedMimetypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(null, false);
        }
    } catch (error) {
        cb(error);
    }
};

const imagePdfFilter = (req, file, cb) => {
    const allowedMimetypes = ['image/png', 'image/jpg', 'image/jpeg', 'application/pdf'];
    try {
        if (allowedMimetypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(null, false);
        }
    } catch (error) {
        cb(error);
    }
};

const uploadSingleImage = multer({
    storage,
    fileFilter: imageFilter,
    limits: {
        fileSize: 5 * 1024 * 1024,     // 5MB
        files: 1,               // Would only allow to use upload.single
    }
});

const uploadImagesPdfs = multer({
    storage,
    fileFilter: imagePdfFilter,
    limits: {
        fileSize: 5 * 1024 * 1024,     // 5MB
    }
});

module.exports = {
    uploadSingleImage,
    uploadImagesPdfs,
};