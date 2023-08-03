const { StatusCodes, getReasonPhrase } = require('http-status-codes');


const errorHandler = (error, req, res, next) => {
  const returnError = {
    status: error.status,
    detail: error.message,
  };
  if (!error.status) {
    console.error(error);
    returnError.status = StatusCodes.INTERNAL_SERVER_ERROR;
    const splitDetail = error.message.split('"')
      .filter((_, index) => {
        if (index % 2 != 0) return false;
        return true;
      });
    returnError.detail = splitDetail.join('').replace("  ", " ").trim();
  }
  try {
    returnError.code = getReasonPhrase(returnError.status);
  } catch (err) {
    returnError.code = `Undefined error code: ${returnError.status}`;
  }
  return res.status(returnError.status).json(returnError);
};

module.exports = errorHandler;
