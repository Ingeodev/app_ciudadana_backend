const { StatusCodes } = require('http-status-codes');

const downloadFile = async (req, res, next) => {
    try {
        console.log(req.params);
        return res.status(StatusCodes.OK)
            .json({ msg: 'TODO' });
    } catch (error) {
        return next(error);
    }
};

module.exports = {
    downloadFile,
};