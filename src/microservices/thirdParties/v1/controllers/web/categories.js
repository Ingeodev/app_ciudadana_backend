const { StatusCodes } = require("http-status-codes");
const db = require("../../../../../models/index");
const validator = require("../../../utils/validators/web/categories.js");

/**
 * Create a thirdParty category
 * @param {object} req - Object containing the name, icon, iconMap, siteUri, color
 * @return {object} Response contains: statuscode (integer), json (objeto): echo reply, if 200OK. Or if there's error, json (objeto): status, code, detail
 */
exports.postRegister = async (req, res, next) => {
  try {
    const { name, icon, iconMap, siteUri, color } =
      await validator.vWebPostRegister(req.body);

    const dataQuery = {
      name,
      icon,
      iconMap,
      siteUri,
      color,
      active: true
    };

    const result = await db.ThirdPartyCategory.create(dataQuery);
    return res.status(StatusCodes.CREATED).json({ meta: null, data: result });
  } catch (error) {
    // console.error("ThirdParty category could not be created: ", error.message);
    return next(error);
  }
};

/**
 * Update a thirdParty category
 * @param {object} req - Object containing the id, name, icon, iconMap, siteUri, color
 * @return {object} Response contains: statuscode (integer), json (category object updated) if 200OK. Or if there's error, json (objeto): status, code, detail
 */
exports.postEdit = async (req, res, next) => {
  try {
    const { id, name, icon, iconMap, siteUri, color } = await validator.vWebPostEdit(
      req.body
    );

    const dataQuery = {
      id,
      name,
      icon,
      iconMap,
      siteUri,
      color,
    };

    const categoryInDb = await db.ThirdPartyCategory.findByPk(id);

    if (categoryInDb === null) {
      throw {
        status: StatusCodes.NOT_FOUND,
        message: `ThirdParty category does not exist`,
      };
    }

    const resultUpdate = await categoryInDb.update(dataQuery);

    return res.status(StatusCodes.OK).json({
      meta: null,
      data: resultUpdate,
    });
  } catch (error) {
    // console.error("ThirdParty categories could not be updated: ", error.message);
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
 * Changes the boolean value of ThirdPartyCategory.active
 * @return {object} Response contains: statuscode (integer), json (objeto): data ThirdPartyCategory. Or if there's error, json (objeto): status, code, detail
 */
exports.postStatus = async (req, res, next) => {
  try {
    const { id, active } = await validator.vWebPostStatus(req.body);
    const catInDb = await db.ThirdPartyCategory.findOne({
      where: { id },
    });

    if (catInDb === null) {
      throw {
        status: StatusCodes.NOT_FOUND,
        message: `Third-party category does not exist`,
      };
    }

    const result = await catInDb.update({ active });

    return res.status(StatusCodes.OK).json({
      meta: null,
      data: result,
    });
  } catch (error) {
    // console.error("ThirdPartyCategory could not be deleted: ", error.message);
    return next(error);
  }
};

/**
 * Get all ThirdParty categories
 * @return {object} Response contains: statuscode (integer), json (objeto): data ThirdParty categories. Or if there's error, json (objeto): status, code, detail
 */
exports.getAll = async (req, res, next) => {
  try {
    const objPage = await validator.vWebGetAll({
      number: req.query.page ? parseInt(req.query.page.number) : null,
      size: req.query.page ? parseInt(req.query.page.size) : null,
    });

    const categInDb = await db.ThirdPartyCategory.findAndCountAll({
      limit: objPage.size,
      offset: (objPage.number - 1) * objPage.size,
      order: [["createdAt", "DESC"]], // Sort by date of creation in descending order
    });

    if (categInDb.count <= 0) {
      throw {
        status: StatusCodes.NOT_FOUND,
        message: "There are no Third-party categories registered in the database",
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
    // console.error("ThirdParty categories could not be recovered: ", error.message);
    return next(error);
  }
};

/**
 * Get ThirdParty category by id
 * @return {object} Response contains: statuscode (integer), json (objeto): data ThirdParty categories. Or if there's error, json (objeto): status, code, detail
 */
exports.getOneById = async (req, res, next) => {
  try {
    const { id } = await validator.vWebGetOneById({
      id: parseInt(req.params.id),
    });

    const categInDb = await db.ThirdPartyCategory.findByPk(id);

    if (categInDb === null) {
      throw {
        status: StatusCodes.NOT_FOUND,
        message: "Third-party category information could not be retrieved",
      };
    }

    return res.status(StatusCodes.OK).send({ meta: null, data: categInDb });
  } catch (error) {
    // console.error("ThirdParty category could not be recovered: ", error.message);
    return next(error);
  }
};

/**
 * Destroy a ThirdParty category (soft delete)
 * @return {object} Response contains: statuscode (integer), json (objeto): id. Or if there's error, json (objeto): status, code, detail
 */
exports.postDelete = async (req, res, next) => {
  try {
    const { id } = await validator.vWebPostDelete(req.body);
    const categInDb = await db.ThirdPartyCategory.findOne({
      where: { id },
    });

    if (categInDb === null) {
      throw {
        status: StatusCodes.NOT_FOUND,
        message: `Third-party category does not exist`,
      };
    }

    // ! Pendiente: Verificar que la categoria no este siendo usada en otras tablas

    await categInDb.destroy();

    return res.status(StatusCodes.OK).json({
      meta: null,
      data: { id },
    });
  } catch (error) {
    // console.error("ThirdParty categories could not be deleted: ", error.message);
    return next(error);
  }
};
