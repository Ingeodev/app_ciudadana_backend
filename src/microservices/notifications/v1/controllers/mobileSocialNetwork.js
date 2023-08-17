const { StatusCodes } = require("http-status-codes");

const validator = require("../../utils/validator");
const db = require("../../../../models/index");


const getSocialNetworks = async (req, res, next) => {
  try {
    const { page: objPage } = await validator.validateSimplePaginationSchema(req.query);

    const socialNetworksInDb = await db.SocialNetwork.findAndCountAll({
      limit: objPage.size,
      offset: (objPage.number - 1) * objPage.size,
      order: [["createdAt", "DESC"]], // Sort by date of creation in descending order
    });

    if (socialNetworksInDb.count <= 0) {
      throw {
        status: StatusCodes.NOT_FOUND,
        message: "There are no Social networks registered in the database",
      };
    }
    if (socialNetworksInDb.rows.length <= 0) {
      throw {
        status: StatusCodes.BAD_REQUEST,
        message: '"page.number" is too large for the number of possible pages',
      };
    }
    const totalPages = Math.ceil(socialNetworksInDb.count / objPage.size);

    const responseCustom = {
      meta: {
        page: objPage.number,
        pageSize: objPage.size,
        totalRecords: socialNetworksInDb.count,
        totalPages: totalPages,
        //TODO: Review AND Implement
        message: 'TODO: Review AND Implement',
      },
      data: socialNetworksInDb.rows,
    };

    return res.status(StatusCodes.OK).send(responseCustom);
  } catch (error) {
    console.error("social networks could not be recovered: ", error.message);
    return next(error);
  }
};

module.exports = {
    getSocialNetworks
};
