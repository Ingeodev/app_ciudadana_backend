const { StatusCodes } = require('http-status-codes');


const errorHandler = (error, req, res, next) => {
    if (!error.status) {
        console.error(error);
        error.status = StatusCodes.INTERNAL_SERVER_ERROR;
    }
    return res.status(error.status).json({
        error: {
            message: error.message
        }
    });
};

module.exports = errorHandler;