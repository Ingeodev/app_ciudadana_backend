const { StatusCodes } = require('http-status-codes');

const sample = async (req, res, next) => {
    return res.status(StatusCodes.OK)
        .json({ msg: 'Web Sample' });
};

module.exports = {
    sample,
};