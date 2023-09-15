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

const pdfFilter = (req, file, cb) => {
    const allowedMimetypes = ['application/pdf'];
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

const excelFilter = (req, file, cb) => {
    const allowedMimetypes = ['application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'];
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

const jsonFilter = (req, file, cb) => {
  // Only JSON mimetype is allowed.
  const allowedMimetypes = ["application/json"];
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

const uploadSingleJSON = multer({
  storage,
  fileFilter: jsonFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
    files: 1, // Only one file is allowed at a time
  },
});

const uploadSingleImage = multer({
    storage,
    fileFilter: imageFilter,
    limits: {
        fileSize: 5 * 1024 * 1024,     // 5MB
        files: 1,               // Would only allow to use upload.single
    }
});

const uploadSinglePdf = multer({
    storage,
    fileFilter: pdfFilter,
    limits: {
        fileSize: 5 * 1024 * 1024,     // 5MB
        files: 1,               // Would only allow to use upload.single
    }
});

const uploadSingleExcel = multer({
    storage,
    fileFilter: excelFilter,
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
  uploadSinglePdf,
  uploadSingleExcel,
  uploadImagesPdfs,
  uploadSingleJSON,
};