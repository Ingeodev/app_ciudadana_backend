const { StatusCodes } = require("http-status-codes");
const { fn, col } = require("sequelize");
const db = require("../../../../models/index.js");
const validator = require("../../utils/validatorGenderAttentionPoint.js");

/**
 * Get all gender attention lines and gender categories
 * @return {object} Response contains: statusCode (integer), json (objeto): data gender attention lines categories. Or if there's error, json (objeto): status, code, detail
 */
exports.getCategoriesnAttentionLines = async (req, res, next) => {
  try {
    // --------------- Gender categories ----------------------------
    const categInDb = await db.GenderCategory.findAndCountAll({
      // // ! Pendiente: Validar permisos del usuario
      attributes: [
        "id",
        "title",
        "description",
        [col("imageUri"), "image"],
        [col("siteUri"), "url"],
      ],

      order: [["title", "ASC"]],
    });


    // --------------- Gender Attention Lines ----------------------------
    const attenLInDb = await db.GenderAttentionLine.findAndCountAll({
      attributes: [
        "name",
        "phone",
        "address",
        [col("imageUri"), "image"],
      ],
      order: [["name", "ASC"]],
    });

    const transformedLines = attenLInDb.rows.map((line) => {
      const lineData = line.get({ plain: true });
      if (lineData.phone != null) {
        lineData.phone = String(lineData.phone).replace("+57", "");
      }
      return lineData;
    });

    const responseCustom = {
      info: categInDb.rows,
      genderLines: transformedLines,
    };

    return res.status(StatusCodes.OK).send(responseCustom);
  } catch (error) {
    // console.error("gender attention lines categories could not be recovered: ", error.message);
    return next(error);
  }
};

/**
 * Get all gender attention points
 * @param {object} req.query - Object containing the number, size, lat, lon
 * @return {object} Response contains: statusCode (integer), json (objeto): gender attention points data. Or if there's error, json (objeto): status, code, detail
 */
exports.getAttentionPoints = async (req, res, next) => {
  try {
    const objPage = await validator.vMobileMGetListAll({
      lat: req.query.lat,
      lon: req.query.lon,
      number: req.query.page ? parseInt(req.query.page.number) : 1,
      size: req.query.page ? parseInt(req.query.page.size) : 100,
    });

    let order = [["name", "ASC"]];
    if (objPage.lat != null && objPage.lon != null) {
      order = [[
        fn("ST_Distance",
          col('geolocation'),
          fn("ST_MakePoint", objPage.lon, objPage.lat)
        ),
        "ASC"]];
    }

    const pointsInDb = await db.GenderAttentionPoint.findAndCountAll({
      limit: objPage.size,
      offset: (objPage.number - 1) * objPage.size,
      order,
      attributes: [
        "id",
        "name",
        "color",
        "iconMap",
        "description",
        "address",
        "phone",
        [col("imageUri"), "image"],
        "geolocation"
      ],
    });

    const transformedPoints = pointsInDb.rows.map((point) => {
      const pointData = point.get({ plain: true });
      if (pointData.phone != null) {
        pointData.phone = String(pointData.phone).replace("+57", "");
      }
      pointData.color = String(pointData.color).replace("#", "");
      pointData.lat = pointData.geolocation.coordinates[1];
      pointData.lon = pointData.geolocation.coordinates[0];
      delete pointData.geolocation;

      return pointData;
    });

    return res.status(StatusCodes.OK).json(transformedPoints);
  } catch (error) {
    return next(error);
  }
};