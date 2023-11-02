const { StatusCodes } = require("http-status-codes");
const { Op, col } = require("sequelize");
const { ne, eq } = Op;
const db = require("../../../../models/index.js");
const validator = require("../../utils/validator.js");
/**
 * Retrieve the advertisements that have no category attached.
 * @param {object} req.query - Object containing the number, size
 * @return {object} Response contains: statusCode (integer), json (objeto): data Cities. Or if there's error, json (objeto): status, code, detail
 */
const getUncategorized = async (req, res, next) => {
  try {
    const objPage = await validator.vGetPublicityAll({
      number: req.query.page ? parseInt(req.query.page.number) : 1,
      size: req.query.page ? parseInt(req.query.page.size) : 100,
    });
    const notCategorizedAdvertisements = await db.Advertisement.findAll({
      where: {
        active: true,
        categoryId: { [eq]: null },
      },
      attributes: [
        [col("imageMobileUri"), "image"],
        [col("imageUri"), "imageWeb"],
        [col("siteUri"), "url"],
      ],
      limit: objPage.size,
      offset: (objPage.number - 1) * objPage.size,
      order: [["createdAt", "DESC"]],
    });
    return res.status(StatusCodes.OK).json(notCategorizedAdvertisements);
  } catch (error) {
    return next(error);
  }
};


/**
 * Retrieve the advertisements with a category attached.
 * @param {object} req.query - Object containing the number, size
 * @return {object} Response contains: statusCode (integer), json (objeto): data Cities. Or if there's error, json (objeto): status, code, detail
 */
const getCategorized = async (req, res, next) => {
  try {
    const objPage = await validator.vGetPublicityAll({
      number: req.query.page ? parseInt(req.query.page.number) : 1,
      size: req.query.page ? parseInt(req.query.page.size) : 100,
    });
    const categorizedAdvertisements = await db.Advertisement.findAll({
      where: {
        active: true,
        categoryId: { [ne]: null },
      },
      include: [
        {
          model: db.MobileService,
          as: "MobileService",
          attributes: ["route"],
          required: true,
        },
      ],
      attributes: [
        [col('"Advertisement"."imageMobileUri"'), "image"],
        [col('"Advertisement"."imageUri"'), "imageWeb"],
        [col("siteUri"), "url"],
      ],
      limit: objPage.size,
      offset: (objPage.number - 1) * objPage.size,
      order: [["createdAt", "DESC"]],
    });
    const banners = categorizedAdvertisements.map((advertisement) => {
      advertisement.dataValues.category =
        advertisement.dataValues.MobileService.route;
      delete advertisement.dataValues.MobileService;
      return advertisement.dataValues;
    });
    return res.status(StatusCodes.OK).json(banners);
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  getUncategorized,
  getCategorized,
};
