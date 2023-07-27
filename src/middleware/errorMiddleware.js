const { StatusCodes, getReasonPhrase } = require('http-status-codes');


const errorHandler = (error, req, res, next) => {
  if (!error.status) {
    error.status = StatusCodes.INTERNAL_SERVER_ERROR;
  }
  let errorCode;
  try{
    errorCode = getReasonPhrase(error.status);
  } catch (err) {
    errorCode = `Undefined error code: ${error.status}`;
  }
  return res.status(error.status).json({
    status: error.status,
    code: errorCode,
    detail: error.message,
  });
};

module.exports = errorHandler;
