const { StatusCodes } = require("http-status-codes");
const { Op } = require("sequelize");
const db = require("../../../../../models/index");
const validator = require("../../../utils/validators/mobile/roadStates.js");
const { formatColorOutputForMobile } = require("../../../../../utils/mobileColorFormatter");
const { dateHourWithOffset, onlyDateWithOffset } = require("../../../../../utils/utcZone.js");

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
      where: {
        // createdBy: createdBy.id,
        endDate: {
          [Op.gte]: onlyDateWithOffset(),
        },
      },
      limit: objPage.size,
      offset: (objPage.number - 1) * objPage.size,
      order: [["createdAt", "DESC"]],
      paranoid: true,
      attributes: [
        "type",
        "title",
        "description",
        "startDate",
        "endDate",
        "startHour",
        "endHour",
        "color",
        "iconMap",
      ],
    });

    let transformedRoads = [];
    for (let i = 0; i < roadsInDb.rows.length; i++) {
      const point = roadsInDb.rows[i];
      const roadData = point.get({ plain: true });     

      let endDate = dateHourWithOffset();
      endDate = endDate.set({
        year: roadData.endDate.split("-")[0],
        month: roadData.endDate.split("-")[1],
        day: roadData.endDate.split("-")[2],
        hour: roadData.endHour.split(":")[0],
        minute: roadData.endHour.split(":")[1],
        second: 0,
        millisecond: 0,
      });

      // Omit records with time in the past
      if (dateHourWithOffset() > endDate) {
        continue;
      }

      let startDate = dateHourWithOffset();
      startDate = startDate.set({
        year: roadData.startDate.split("-")[0],
        month: roadData.startDate.split("-")[1],
        day: roadData.startDate.split("-")[2],
        hour: roadData.startHour.split(":")[0],
        minute: roadData.startHour.split(":")[1],
        second: 0,
        millisecond: 0,
      });

      roadData.color = formatColorOutputForMobile(roadData.color);
      let tempType = null;
      switch (String(roadData.type.type).toLowerCase()) {
        case "linestring":
          tempType = "line";
          roadData.points = roadData.type.coordinates.map((coord) => ({
            lat: coord[1],
            lon: coord[0],
          }));
          break;
        case "point":
          tempType = String(roadData.type.type).toLowerCase();
          roadData.points = [
            {
              lat: roadData.type.coordinates[1],
              lon: roadData.type.coordinates[0],
            },
          ];
          break;
        case "polygon":
          tempType = String(roadData.type.type).toLowerCase();
          roadData.points = roadData.type.coordinates[0].map((coord) => {
            return {
              lat: coord[1],
              lon: coord[0],
            };
          });
          break;
        default:
          throw {
            message: `Geometry type not supported: ${roadData.type.type}`,
            status: StatusCodes.INTERNAL_SERVER_ERROR,
          };
          break;
      }
      delete roadData.type;
      roadData.type = tempType;
      roadData.startDate = startDate;
      roadData.endDate = endDate;
      delete roadData.startHour;
      delete roadData.endHour;
      transformedRoads.push(roadData);
    }

    return res.status(StatusCodes.OK).json(transformedRoads);
  } catch (error) {
    // console.error("Road states could not be recovered: ", error.message);
    return next(error);
  }
};
