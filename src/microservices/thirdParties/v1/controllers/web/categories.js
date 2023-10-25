const { StatusCodes } = require("http-status-codes");
const db = require("../../../../../models/index");
const validator = require("../../../utils/validators/web/categories.js");

/**
 * Create a thirdParty category
 * @param {object} req - Object containing the name, icon, iconMap, color
 * @return {object} Response contains: statusCode (integer), json (objeto): echo reply, if 200OK. Or if there's error, json (objeto): status, code, detail
 */
exports.postRegister = async (req, res, next) => {
  try {
    const { name, icon, iconMap, color } =
      await validator.vWebPostRegister(req.body);

    const result = await db.ThirdPartyCategory.create({
      name,
      icon,
      iconMap,
      color,
    });
    return res.status(StatusCodes.CREATED).json({ meta: null, data: result });
  } catch (error) {
    // console.error("ThirdParty category could not be created: ", error.message);
    if (error.name === 'SequelizeUniqueConstraintError' && error.fields && error.fields.name) {
        error.message = "Name must be unique";
        error.status = StatusCodes.BAD_REQUEST;
    } 
    return next(error);
  }
};

/**
 * Update a thirdParty category
 * @param {object} req - Object containing the id, name, icon, iconMap, color
 * @return {object} Response contains: statusCode (integer), json (category object updated) if 200OK. Or if there's error, json (objeto): status, code, detail
 */
exports.postEdit = async (req, res, next) => {
  try {
    const { id, name, icon, iconMap, color } = await validator.vWebPostEdit(
      req.body
    );

    const categoryInDb = await db.ThirdPartyCategory.findByPk(id);

    if (categoryInDb === null) {
      throw {
        status: StatusCodes.NOT_FOUND,
        message: `ThirdParty category does not exist`,
      };
    }

    const resultUpdate = await categoryInDb.update({
      id,
      name,
      icon,
      iconMap,
      color,
    });

    return res.status(StatusCodes.OK).json({
      meta: null,
      data: resultUpdate,
    });
  } catch (error) {
    // console.error("ThirdParty categories could not be updated: ", error.message);
    if (error.name === 'SequelizeUniqueConstraintError' && error.fields && error.fields.name) {
        error.message = "Name must be unique";
        error.status = StatusCodes.BAD_REQUEST;
    } else if (error && error.errors && error.errors.length > 0 && error.errors[0].message) {
        error.message = error.errors[0].message;
    }
    return next(error);
  }
};

/**
 * Get all ThirdParty categories
 * @param {object} req.query - Object containing the number, size
 * @return {object} Response contains: statusCode (integer), json (objeto): data ThirdParty categories. Or if there's error, json (objeto): status, code, detail
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

    let message = undefined;
    if (categInDb.count <= 0)
      message = "There are no third-party categories registered";
    if (categInDb.rows.length <= 0)
      message = '"page[number]" is too large for the number of possible pages';

    return res.status(StatusCodes.OK).json({
      meta: {
        message,
        page: objPage.number,
        pageSize: objPage.size,
        totalRecords: categInDb.count,
        totalPages: Math.ceil(categInDb.count / objPage.size),
      },
      data: categInDb.rows,
    });
  } catch (error) {
    // console.error("ThirdParty categories could not be recovered: ", error.message);
    return next(error);
  }
};

/**
 * Get ThirdParty category by id
 * @param {integer} req.params.id - id of the company
 * @return {object} Response contains: statusCode (integer), json (objeto): data thirdParty category. Or if there's error, json (objeto): status, code, detail
 */
exports.getOneById = async (req, res, next) => {
  try {
    const { id } = await validator.vWebGetOneById({
      id: req.params.id ? parseInt(req.params.id) : null,
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
 * @param {integer} req.body.id - id of ThirdParty category
 * @return {object} Response contains: statusCode (integer), json (objeto): id. Or if there's error, json (objeto): status, code, detail
 */
exports.postDelete = async (req, res, next) => {
  try {
    const { id } = await validator.vWebPostDelete(req.body);
    const categInDb = await db.ThirdPartyCategory.findByPk(id, {
      include: [
        {
          model: db.ThirdPartyCompany,
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
        message: `Third-party category does not exist`,
      };
    }

    if (categInDb.ThirdPartyCompanies != 0)
      throw {
        status: StatusCodes.UNPROCESSABLE_ENTITY,
        message: `Category has related companies`,
      };

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
