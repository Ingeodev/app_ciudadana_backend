const { StatusCodes } = require('http-status-codes');

const postSingleImage = async (req, res, next) => {
    try {
        return res.status(StatusCodes.OK)
            .json({ msg: 'TODO' });
    } catch (error) {
        return next(error);
    }
};

const postSinglePdf = async (req, res, next) => {
    try {
        return res.status(StatusCodes.OK)
            .json({ msg: 'TODO' });
    } catch (error) {
        return next(error);
    }
};

module.exports = {
    postSingleImage,
    postSinglePdf,
};