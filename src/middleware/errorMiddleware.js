const { StatusCodes } = require('http-status-codes');


const errorHandler = (error, req, res, next) => {
    if (!error.status) {
        error.status = StatusCodes.INTERNAL_SERVER_ERROR;
    }
    return res.status(error.status).json({
      status: StatusCodes.INTERNAL_SERVER_ERROR,
      code: "Internal Server Error",
      detail: error.message,
    });
};

module.exports = errorHandler;
