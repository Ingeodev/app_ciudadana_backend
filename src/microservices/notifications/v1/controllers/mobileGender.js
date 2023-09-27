const { StatusCodes } = require("http-status-codes");
const db = require("../../../../models/index.js");
// const validator = require("../../utils/validatorGenderCategory.js");

/**
 * Get all gender attention lines and gender categories
 * @param {object} req.query - Object containing the number and size
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
