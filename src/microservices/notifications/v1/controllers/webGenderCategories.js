const { StatusCodes } = require("http-status-codes");
const db = require("../../../../models/index.js");
const validator = require("../../utils/validatorGenderCategory.js");

/**
 * Create a security category
 * @param {object} req - Object containing the name, imageUri, color
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
    
    const { name, imageUri, color } = await validator.vWebPostRegister(
      req.body
    );

    const dataQuery = {
      createdBy: createdBy.id,
      name,
      imageUri,
      color,
    };

    const result = await db.GenderCategory.create(dataQuery);
    delete result.dataValues.createdBy;
    delete result.dataValues.deletedAt;
    // ! Para front es necesario los timestamps?
    return res.status(StatusCodes.CREATED).json({ meta: null, data: result });
  } catch (error) {
    // console.error("security category could not be created: ", error.message);
    return next(error);
  }
};

/**
 * Update security category
 * @param {object} req - Object containing the id, name, imageUri, color
 * @return {object} Response contains: statuscode (integer), json (category object updated) if 200OK. Or if there's error, json (objeto): status, code, detail
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

    const { id, name, imageUri, color } = await validator.vWebPostEdit(
      req.body
    );

    const dataQuery = {
      id,
      name,
      imageUri,
      color,
    };

    // Validate that the genderCategory belongs to the user
    const categoryInDb = await db.GenderCategory.findOne({
      where: {
        id,
        // ! Pendiente: Validar permisos del usuario
        createdBy: createdBy.id,
      },
    });

    if (categoryInDb == null)
      throw {
        message: "Category editing failure",
        status: StatusCodes.UNPROCESSABLE_ENTITY,
      };

    const resultUpdate = await categoryInDb.update(dataQuery);
    delete resultUpdate.dataValues.createdBy;
    delete resultUpdate.dataValues.deletedAt;
    // ! Para front es necesario los timestamps?
    return res.status(StatusCodes.OK).json({
      meta: null,
      data: resultUpdate,
    });
  } catch (error) {
    // console.error("security categories could not be updated: ", error.message);
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
 * Get all security categories
 * @return {object} Response contains: statuscode (integer), json (objeto): data security categories. Or if there's error, json (objeto): status, code, detail
 */
exports.getAll = async (req, res, next) => {
  try {
    // ! Por el momento, las categorias se pueden obtener sin importar si es de su creador o no.
    // ! Dado que fueron creadas por el admin
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
    
    const objPage = await validator.vWebGetAll({
      number: req.query.page ? parseInt(req.query.page.number) : null,
      size: req.query.page ? parseInt(req.query.page.size) : null,
    });

    const categInDb = await db.GenderCategory.findAndCountAll({
      // ! Pendiente: Validar permisos del usuario
      // where: { createdBy: createdBy.id },
      attributes: ["id", "name", "imageUri", "color"],
      limit: objPage.size,
      offset: (objPage.number - 1) * objPage.size,
      order: [["name", "ASC"]], // Sort by date of creation in descending order
    });

    if (categInDb.count <= 0) {
      throw {
        status: StatusCodes.NOT_FOUND,
        message: "There are no security categories registered in the database",
      };
    }
    if (categInDb.rows.length <= 0) {
      throw {
        status: StatusCodes.BAD_REQUEST,
        message: '"page.number" is too large for the number of possible pages',
      };
    }
    const totalPages = Math.ceil(categInDb.count / objPage.size);

    const responseCustom = {
      meta: {
        page: objPage.number,
        pageSize: objPage.size,
        totalRecords: categInDb.count,
        totalPages: totalPages,
      },
      data: categInDb.rows,
    };

    return res.status(StatusCodes.OK).send(responseCustom);
  } catch (error) {
    // console.error("security categories could not be recovered: ", error.message);
    return next(error);
  }
};

// /**
//  * Get security category by id
//  * @return {object} Response contains: statuscode (integer), json (objeto): data security categories. Or if there's error, json (objeto): status, code, detail
//  */
// exports.getOneById = async (req, res, next) => {
//   try {
//     const { id } = await validator.vWebGetOneById({
//       id: parseInt(req.params.id),
//     });

//     const categInDb = await db.GenderCategory.findByPk(id);

//     if (categInDb === null) {
//       throw {
//         status: StatusCodes.NOT_FOUND,
//         message: "Security category information could not be retrieved",
//       };
//     }

//     return res.status(StatusCodes.OK).send({ meta: null, data: categInDb });
//   } catch (error) {
//     // console.error("Security category could not be recovered: ", error.message);
//     return next(error);
//   }
// };

/**
 * Destroy a security category (soft delete)
 * @return {object} Response contains: statuscode (integer), json (objeto): id. Or if there's error, json (objeto): status, code, detail
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
    const categInDb = await db.GenderCategory.findOne({
      where: {
        id,
        // ! Pendiente: Validar permisos del usuario
        createdBy: createdBy.id,
      },
    });

    if (categInDb === null) {
      throw {
        status: StatusCodes.NOT_FOUND,
        message: `The security category does not exist`,
      };
    }

    await categInDb.destroy();

    return res.status(StatusCodes.OK).json({
      meta: null,
      data: { id },
    });
  } catch (error) {
    // console.error("users could not be deleted: ", error.message);
    return next(error);
  }
};
