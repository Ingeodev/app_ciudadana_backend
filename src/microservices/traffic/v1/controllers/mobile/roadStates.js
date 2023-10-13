const { StatusCodes } = require("http-status-codes");
const { Sequelize } = require("sequelize");
const db = require("../../../../../models/index");
const validator = require("../../../utils/validators/mobile/roadStates.js");
const { formatColorOutputForMobile } = require("../../../../../utils/mobileColorFormatter");

/**
 * Get all routes states
 * @param {object} req.query - Object containing the number, size
 * @return {object} Response contains: statusCode (integer), json (objeto): companies data. Or if there's error, json (objeto): status, code, detail
 */
exports.getRoadStates = async (req, res, next) => {
  try {

    const objPage = await validator.vMobileGetRoadStates({
      number: req.query.page ? parseInt(req.query.page.number) : 1,
      size: req.query.page ? parseInt(req.query.page.size) : 100,
    });

    const roadsInDb = await db.RoadState.findAndCountAll({
      // // ! Pendiente: Validar permisos del usuario
      // where: { createdBy: createdBy.id },
      limit: objPage.size,
      offset: (objPage.number - 1) * objPage.size,
      order: [["createdAt", "DESC"]],
      attributes: ["type", "title", "startDate", "endDate", "color", "iconMap"],
    });

    // if (roadsInDb.count <= 0)
    //   throw {
    //     status: StatusCodes.NOT_FOUND,
    //     message: "There are not roads states registered",
    //   };
    // if (roadsInDb.rows.length <= 0)
    //   throw {
    //     status: StatusCodes.BAD_REQUEST,
    //     message: '"page.number" is too large for the number of possible pages',
    //   };

    const transformedRoads = roadsInDb.rows.map((point) => {
      const roadData = point.get({ plain: true }); 
      roadData.color = formatColorOutputForMobile(roadData.color);
      const tempType = roadData.type.type;
      roadData.points = roadData.type.coordinates;
      delete roadData.type;
      roadData.type = tempType;
      return roadData;
    });

    return res.status(StatusCodes.OK).json(transformedRoads);
  } catch (error) {
    // console.error("companies could not be recovered: ", error.message);
    return next(error);
  }
};
