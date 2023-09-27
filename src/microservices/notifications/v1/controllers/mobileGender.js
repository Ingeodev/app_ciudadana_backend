const { StatusCodes } = require("http-status-codes");
const { Sequelize } = require("sequelize");
const db = require("../../../../models/index.js");
const validator = require("../../utils/validatorGenderAttentionPoint.js");

/**
 * Get all gender attention lines and gender categories
 * @return {object} Response contains: statuscode (integer), json (objeto): data gender attention lines categories. Or if there's error, json (objeto): status, code, detail
 */
exports.getCategoriesnAttentionLines = async (req, res, next) => {
  try {
    // ! Por el momento, las categorias se pueden obtener sin importar si es de su creador o no.
    // // ! Pendiente: Validar permisos del usuario

    // --------------- Gender categories ----------------------------
    const categInDb = await db.GenderCategory.findAndCountAll({
      // // ! Pendiente: Validar permisos del usuario
      // where: { createdBy: createdBy.id },
      attributes: {
        exclude: [
          "createdBy",
          "siteUri",
          "imageUri",
          "createdAt",
          "updatedAt",
          "deletedAt",
        ],
        include: [
          "id",
          "title",
          "description",
          ["imageUri", "image"],
          ["siteUri", "url"],
        ],
      },

      // limit: objPage.size,
      // offset: (objPage.number - 1) * objPage.size,
      order: [["title", "ASC"]], // Sort by date of creation in descending order
    });

    // const totalPages = Math.ceil(categInDb.count / objPage.size);

    // --------------- Gender Attention Lines ----------------------------
    const attenLInDb = await db.GenderAttentionLine.findAndCountAll({
      // // ! Pendiente: Validar permisos del usuario
      // where: { createdBy: createdBy.id },
      attributes: {
        exclude: [
          "id",
          "createdBy",
          "imageUri",
          "createdAt",
          "updatedAt",
          "deletedAt",
        ],
        include: ["name", "phone", "address", ["imageUri", "image"]],
      },
      // limit: objPage.size,
      // offset: (objPage.number - 1) * objPage.size,
      order: [["name", "ASC"]], // Sort by date of creation in descending order
    });

    if (categInDb.count <= 0 && attenLInDb.count <= 0)
      throw {
        status: StatusCodes.NOT_FOUND,
        message: "There are no gender equality hotlines or registered categories",
      };


    const responseCustom = {
      // meta: {
      //   page: objPage.number,
      //   pageSize: objPage.size,
      //   totalRecords: categInDb.count,
      //   totalPages: totalPages,
      // },
      info: categInDb.rows,
      genderLines: attenLInDb.rows,
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
 * @return {object} Response contains: statuscode (integer), json (objeto): companies data. Or if there's error, json (objeto): status, code, detail
 */
exports.getAttentionPoins = async (req, res, next) => {
  try {
    // // ! Pendiente: Validar permisos del usuario
    // const createdBy = await db.User.findOne({
    //   where: { disabled: false, userMobile: false, clientId: res.locals.uid },
    //   attributes: ["id"],
    // });

    // if (createdBy == null || createdBy.id == null)
    //   throw {
    //     message: "User not found",
    //     status: StatusCodes.NOT_FOUND,
    //   };

    const objPage = await validator.vMobileMGetListAll({
      lat: req.query.lat,
      lon: req.query.lon,
      number: req.query.page ? parseInt(req.query.page.number) : 1,
      size: req.query.page ? parseInt(req.query.page.size) : 100,
    });

    let order = [["name", "ASC"]];
    if (objPage.lat != null && objPage.lon != null) {
      order = [[
        Sequelize.fn("ST_Distance",
          Sequelize.col('geolocation'),
          Sequelize.fn("ST_MakePoint", objPage.lon, objPage.lat)
        ),
        "ASC"]];
    }
 
    const pointsInDb = await db.GenderAttentionPoint.findAndCountAll({
      // // ! Pendiente: Validar permisos del usuario
      // where: { createdBy: createdBy.id },
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
        // ["imageUri", "image"],
        [Sequelize.col("imageUri"), "image"],
        "geolocation"
      ],
    });

    if (pointsInDb.count <= 0)
      throw {
        status: StatusCodes.NOT_FOUND,
        message: "There are not companies registered",
      };
    if (pointsInDb.rows.length <= 0)
      throw {
        status: StatusCodes.BAD_REQUEST,
        message: '"page.number" is too large for the number of possible pages',
      };

    const transformedCompanies = pointsInDb.rows.map((point) => {
      const pointData = point.get({ plain: true }); // Convert Sequelize instance to simple object
      pointData.color = String(pointData.color).replace("#", "");
      pointData.lat = pointData.geolocation.coordinates[1];
      pointData.lon = pointData.geolocation.coordinates[0];
      delete pointData.geolocation;

      return pointData;
    });

    return res.status(StatusCodes.OK).send(transformedCompanies);
  } catch (error) {
    // console.error("companies could not be recovered: ", error.message);
    return next(error);
  }
};