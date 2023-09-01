const { StatusCodes } = require("http-status-codes");
const db = require("../../../../models/index.js");
const validator = require("../../utils/validatorSecurityCategory.js");

/**
 * Create a security category
 * @param {object} req - Object containing the name, imageUri, color
 * @return {object} Response contains: statuscode (integer), json (objeto): echo reply, if 200OK. Or if there's error, json (objeto): status, code, detail
 */
exports.postRegister = async (req, res, next) => {
  try {
    const { name, imageUri, color } = await validator.vWebPostRegister(
      req.body
    );

    const dataQuery = {
      name,
      imageUri,
      color,
    };

    const result = await db.SecurityCategory.create(dataQuery);
    return res.status(StatusCodes.CREATED).json({ meta: null, data: result });
  } catch (error) {
    console.error("security category could not be created: ", error.message);
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
    const { id, name, imageUri, color } = await validator.vWebPostEdit(req.body);

    const dataQuery = {
      id,
      name,
      imageUri,
      color,
    };

    const categoryInDb = await db.SecurityCategory.findByPk(id);

    if (categoryInDb === null) {
      throw {
        status: StatusCodes.NOT_FOUND,
        message: `The security category does not exist`,
      };
    }

    const resultUpdate = await categoryInDb.update(dataQuery);

    return res.status(StatusCodes.OK).json({
      meta: null,
      data: resultUpdate,
    });
  } catch (error) {
    console.error("security categories could not be updated: ", error.message);
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
    const objPage = await validator.vWebGetAll({
      number: req.query.page ? parseInt(req.query.page.number) : null,
      size: req.query.page ? parseInt(req.query.page.size) : null,
    });

    const categInDb = await db.SecurityCategory.findAndCountAll({
      limit: objPage.size,
      offset: (objPage.number - 1) * objPage.size,
      order: [["createdAt", "DESC"]], // Sort by date of creation in descending order
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
    console.error("security categories could not be recovered: ", error.message);
    return next(error);
  }
};

/**
 * Get security category by id
 * @return {object} Response contains: statuscode (integer), json (objeto): data security categories. Or if there's error, json (objeto): status, code, detail
 */
exports.getOneById = async (req, res, next) => {
  try {
    const { id } = await validator.vWebGetOneById({
      id: parseInt(req.params.id),
    });

    const categInDb = await db.SecurityCategory.findByPk(id);

    if (categInDb === null) {
      throw {
        status: StatusCodes.NOT_FOUND,
        message: "Security category information could not be retrieved",
      };
    }

    return res
      .status(StatusCodes.OK)
      .send({ meta: null, data: categInDb });
  } catch (error) {
    console.error("Security category could not be recovered: ", error.message);
    return next(error);
  }
};

/**
 * Destroy a security category (soft delete)
 * @return {object} Response contains: statuscode (integer), json (objeto): id. Or if there's error, json (objeto): status, code, detail
 */
exports.postDelete = async (req, res, next) => {
  try {
    const { id } = await validator.vWebPostDelete(req.body);
    const categInDb = await db.SecurityCategory.findByPk(id, {
      include: [
        {
          model: db.Report,
          attributes: ["id"],
          required: false,
        },
      ],
      attributes: ["id"],
      paranoid: true,
    });

    if (categInDb === null) {
      throw {
        status: StatusCodes.NOT_FOUND,
        message: `The security category does not exist`,
      };
    }

    if (categInDb.Reports.length != 0)
      throw {
        status: StatusCodes.UNPROCESSABLE_ENTITY,
        message: "The category has related reports",
      };

    await categInDb.destroy();
    
    return res.status(StatusCodes.OK).json({
      meta: null,
      data: { id }
    });
  } catch (error) {
    // console.error("users could not be deleted: ", error.message);
    return next(error);
  }
};