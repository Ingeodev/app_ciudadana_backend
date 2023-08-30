const { StatusCodes } = require("http-status-codes");
const db = require("../../../../models/index.js");
const validator = require("../../utils/validatorGenderAttentionLine.js");

/**
 * Create an attention line of gender equity 
 * @param {object} req - Object containing the categoryId, name, phone, address, imageUri
 * @return {object} Response contains: statuscode (integer), json (objeto): echo reply, if 200OK. Or if there's error, json (objeto): status, code, detail
 */
exports.postRegister = async (req, res, next) => {
  try {
    // ! Pendiente: Validar permisos del usuario
    const createdBy = await db.User.findOne({
      where: { disabled: false, userMobile: false, clientId: res.locals.uid },
      attributes: ["id"],
    });

    if (createdBy == null || createdBy.id == null)
      throw {
        message: "User not found.",
        status: StatusCodes.NOT_FOUND,
      };
    
    // ! Por el momento categoryId, voy a suponer que la crea el admin, ie, las categorias son accesibles para todos los webUsuarios normales
    const { categoryId, name, phone, address, imageUri } = await validator.vWebPostRegister(
      req.body
    );

    const dataQuery = {
      categoryId,
      createdBy: createdBy.id,
      name,
      phone,
      imageUri,
      address,
    };

    const result = await db.GenderAttentionLine.create(dataQuery);
    delete result.dataValues.createdBy;
    delete result.dataValues.deletedAt;
    return res.status(StatusCodes.CREATED).json({ meta: null, data: result });
  } catch (error) {
    // console.error("attention line of gender equity could not be created: ", error.message);
    return next(error);
  }
};

/**
 * Update an attention line of gender equity
 * @param {object} req - Object containing the id, categoryId, name, phone, address, imageUri
 * @return {object} Response contains: statuscode (integer), json (objeto): echo reply, if 200OK. Or if there's error, json (objeto): status, code, detail
 */
exports.postEdit = async (req, res, next) => {
  try {
    // ! Pendiente: Validar permisos del usuario
    const createdBy = await db.User.findOne({
      where: { disabled: false, userMobile: false, clientId: res.locals.uid },
      attributes: ["id"],
    });

    if (createdBy == null || createdBy.id == null)
      throw {
        message: "User not found",
        status: StatusCodes.NOT_FOUND,
      };

    const { id, categoryId, name, phone, address, imageUri } =
      await validator.vWebPostUpdate(req.body);

    const dataQuery = {
      id,
      categoryId,
      name,
      phone,
      imageUri,
      address,
    };

    // Validate that the gender attentio line belongs to the user
    const attLInDb = await db.GenderAttentionLine.findOne({
      where: {
        id,
        // ! Pendiente: Validar permisos del usuario
        createdBy: createdBy.id,
      },
    });

    if (attLInDb == null)
      throw {
        message: "Attention line editing failure",
        status: StatusCodes.UNPROCESSABLE_ENTITY,
      };

    const resultUpdate = await attLInDb.update(dataQuery);
    delete resultUpdate.dataValues.createdBy;
    delete resultUpdate.dataValues.deletedAt;

    return res.status(StatusCodes.OK).json({
      meta: null,
      data: resultUpdate,
    });
  } catch (error) {
    // console.error("attention line of gender equity could not be updated: ", error.message);
    if (
      error &&
      error.errors &&
      error.errors.length > 0 &&
      error.errors[0].message
    ) {
      error.message = error.errors[0].message;
    }
    return next(error);
  }
};


/**
 * Get all attention lines of gender equity
 * @return {object} Response contains: statuscode (integer), json (objeto): data attention lines. Or if there's error, json (objeto): status, code, detail
 */
exports.getListAll = async (req, res, next) => {
  try {
    // ! Pendiente: Validar permisos del usuario
    const createdBy = await db.User.findOne({
      where: { disabled: false, userMobile: false, clientId: res.locals.uid },
      attributes: ["id"],
    });

    if (createdBy == null || createdBy.id == null)
      throw {
        message: "User not found",
        status: StatusCodes.NOT_FOUND,
      };

    const objPage = await validator.vWebGetListAll({
      number: req.query.page ? parseInt(req.query.page.number) : null,
      size: req.query.page ? parseInt(req.query.page.size) : null,
    });

    const attLinesInDb = await db.GenderAttentionLine.findAndCountAll({
      // ! Pendiente: Validar permisos del usuario
      where: { createdBy: createdBy.id },
      // ! Para front es necesario los timestamps?
      attributes: ["id", "categoryId", "name", "phone", "address", "imageUri"],
      limit: objPage.size,
      offset: (objPage.number - 1) * objPage.size,
      order: [["createdAt", "DESC"]], // Sort by date of creation in descending order
    });

    if (attLinesInDb.count <= 0)
      throw {
        status: StatusCodes.NOT_FOUND,
        message:
          "There are no an attention lines of gender equity registered in the database",
      };
    if (attLinesInDb.rows.length <= 0)
      throw {
        status: StatusCodes.BAD_REQUEST,
        message: '"page.number" is too large for the number of possible pages',
      };
    const totalPages = Math.ceil(attLinesInDb.count / objPage.size);

    const responseCustom = {
      meta: {
        page: objPage.number,
        pageSize: objPage.size,
        totalRecords: attLinesInDb.count,
        totalPages: totalPages,
      },
      data: attLinesInDb.rows,
    };

    return res.status(StatusCodes.OK).send(responseCustom);
  } catch (error) {
    // console.error("attention lines could not be recovered: ", error.message);
    return next(error);
  }
};

// /**
//  * Get an attention line of gender equity by id
//  * @return {object} Response contains: statuscode (integer), json (objeto): data attention line. Or if there's error, json (objeto): status, code, detail
//  */
// exports.getSecurity = async (req, res, next) => {
//   try {
//     const { id } = await validator.vWebGetOne({
//       id: parseInt(req.params.id),
//     });

//     const attentionLInDb = await db.GenderAttentionLine.findByPk(id);

//     if (attentionLInDb === null) {
//       throw {
//         status: StatusCodes.NOT_FOUND,
//         message: "attention line of gender equity information could not be retrieved",
//       };
//     }

//     return res
//       .status(StatusCodes.OK)
//       .send({ meta: null, data: attentionLInDb });
//   } catch (error) {
//     // console.error("attention lines could not be recovered: ", error.message);
//     return next(error);
//   }
// };

/**
 * Destroy (Soft delete) an attention line of gender equity
 * @return {object} Response contains: statuscode (integer), json (objeto): data attention line. Or if there's error, json (objeto): status, code, detail
 */
exports.postDelete = async (req, res, next) => {
  try {
    // ! Pendiente: Validar permisos del usuario
    const createdBy = await db.User.findOne({
      where: { disabled: false, userMobile: false, clientId: res.locals.uid },
      attributes: ["id"],
    });

    if (createdBy == null || createdBy.id == null)
      throw {
        message: "User not found",
        status: StatusCodes.NOT_FOUND,
      };
    
    const { id } = await validator.vWebPostDelete(req.body);
    const attLInDb = await db.GenderAttentionLine.findOne({
      where: {
        id,
        // ! Pendiente: Validar permisos del usuario
        createdBy: createdBy.id,
      },
    });

    if (attLInDb === null) {
      throw {
        status: StatusCodes.NOT_FOUND,
        message: `The attention line of gender equity does not exist`,
      };
    }

    await attLInDb.destroy();

    return res.status(StatusCodes.OK).send({ meta: null, data: { id } });
  } catch (error) {
    // console.error("attention line could not be updated: ", error.message);
    return next(error);
  }
};