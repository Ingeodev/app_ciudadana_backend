const Busboy = require("busboy");
const { StatusCodes } = require("http-status-codes");

const IMAGE_MIMETYPES = ["image/png", "image/jpg", "image/jpeg"];
const PDF_MIMETYPES = ["application/pdf"];
const EXCEL_MIMETYPES = [
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
];
const IMAGE_PDF_MIMETYPES = [...IMAGE_MIMETYPES, ...PDF_MIMETYPES];
const JSON_MIMETYPES = ["application/json"];

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

function createUploadMiddleware(fieldName, allowedMimetypes) {
  return (req, res, next) => {
    if (!req.rawBody) {
      return next(
        Object.assign(new Error("rawBody not available"), {
          status: StatusCodes.BAD_REQUEST,
        })
      );
    }

    const busboy = Busboy({
      headers: req.headers,
      limits: { fileSize: MAX_FILE_SIZE, files: 1 },
    });

    let fileData = null;
    let fileSize = 0;
    let fileError = null;
    const fields = {};

    busboy.on("file", (name, stream, info) => {
      if (name !== fieldName) {
        stream.resume();
        return;
      }

      const { mimeType, filename } = info;

      if (!allowedMimetypes.includes(mimeType)) {
        fileError = Object.assign(
          new Error(`File type ${mimeType} not allowed`),
          { status: StatusCodes.UNSUPPORTED_MEDIA_TYPE }
        );
        stream.resume();
        return;
      }

      const chunks = [];
      stream.on("data", (chunk) => {
        chunks.push(chunk);
        fileSize += chunk.length;
        if (fileSize > MAX_FILE_SIZE) {
          fileError = Object.assign(new Error("File too large"), {
            status: StatusCodes.REQUEST_TOO_LONG,
          });
          stream.resume();
        }
      });

      stream.on("end", () => {
        fileData = {
          fieldname: name,
          originalname: filename,
          encoding: "7bit",
          mimetype: mimeType,
          buffer: Buffer.concat(chunks),
          size: fileSize,
        };
      });
    });

    busboy.on("field", (name, value) => {
      fields[name] = value;
    });

    busboy.on("error", (err) => {
      return next(
        Object.assign(err, { status: StatusCodes.INTERNAL_SERVER_ERROR })
      );
    });

    busboy.on("close", () => {
      if (fileError) return next(fileError);

      req.file = fileData;
      req.body = fields;
      next();
    });

    busboy.end(req.rawBody);
  };
}

const uploadSingleImage = createUploadMiddleware("image", IMAGE_MIMETYPES);
const uploadSinglePdf = createUploadMiddleware("file", PDF_MIMETYPES);
const uploadSingleExcel = createUploadMiddleware("file", EXCEL_MIMETYPES);
const uploadImagesPdfs = createUploadMiddleware("image", IMAGE_PDF_MIMETYPES);
const uploadSingleJSON = createUploadMiddleware("file", JSON_MIMETYPES);
const uploadSinglePqrsFile = createUploadMiddleware("file", IMAGE_PDF_MIMETYPES);

module.exports = {
  uploadSingleImage,
  uploadSinglePdf,
  uploadSingleExcel,
  uploadImagesPdfs,
  uploadSingleJSON,
  uploadSinglePqrsFile,
};
