const { StatusCodes } = require("http-status-codes");
const db = require("../../../../../models/index");
const validator = require("../../../utils/validators/web/cities.js");
const { Op, Sequelize } = require("sequelize");

/**
 * Create a city
 * @param {object} req - Object containing the city, cityCode, state
 * @return {object} Response contains: statuscode (integer), json (objeto): echo reply, if 200OK. Or if there's error, json (objeto): status, code, detail
 */
exports.postRegister = async (req, res, next) => {
  try {
    const { city, cityCode, state } = await validator.vWebPostRegister(req.body);

    const dataQuery = {
      city,
      cityCode,
      state,
    };

    const result = await db.City.create(dataQuery);
    delete result.dataValues.deletedAt;
    return res.status(StatusCodes.CREATED).json({ meta: null, data: result });
  } catch (error) {
    // console.error("City could not be created: ", error.message);
    return next(error);
  }
};

/**
 * Update a city
 * @param {object} req - Object containing the id, city, cityCode, state
 * @return {object} Response contains: statuscode (integer), json (City object updated) if 200OK. Or if there's error, json (objeto): status, code, detail
 */
exports.postEdit = async (req, res, next) => {
  try {
    const { id, city, cityCode, state } = await validator.vWebPostEdit(
      req.body
    );

    const dataQuery = {
      id,
      city,
      cityCode,
      state,
    };

    const cityInDb = await db.City.findByPk(id);

    if (cityInDb === null) {
      throw {
        status: StatusCodes.NOT_FOUND,
        message: `City does not exist`,
      };
    }

    const resultUpdate = await cityInDb.update(dataQuery);
    delete resultUpdate.dataValues.deletedAt;
    return res.status(StatusCodes.OK).json({
      meta: null,
      data: resultUpdate,
    });
  } catch (error) {
    // console.error("City could not be updated: ", error.message);
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
 * Get all  Cities
 * @return {object} Response contains: statuscode (integer), json (objeto): data Cities. Or if there's error, json (objeto): status, code, detail
 */
exports.getAll = async (req, res, next) => {
  try {
    const objPage = await validator.vWebGetAll({
      number: req.query.page ? parseInt(req.query.page.number) : null,
      size: req.query.page ? parseInt(req.query.page.size) : null,
    });

    const citiesInDb = await db.City.findAndCountAll({
      limit: objPage.size,
      offset: (objPage.number - 1) * objPage.size,
      order: [["city", "ASC"]],
      attributes: {
        exclude: ["deletedAt"],
      },
    });

    if (citiesInDb.count <= 0) {
      throw {
        status: StatusCodes.NOT_FOUND,
        message: "There are no cities registered in the database",
      };
    }
    if (citiesInDb.rows.length <= 0) {
      throw {
        status: StatusCodes.BAD_REQUEST,
        message: '"page.number" is too large for the number of possible pages',
      };
    }
    const totalPages = Math.ceil(citiesInDb.count / objPage.size);

    const responseCustom = {
      meta: {
        page: objPage.number,
        pageSize: objPage.size,
        totalRecords: citiesInDb.count,
        totalPages: totalPages,
      },
      data: citiesInDb.rows,
    };

    return res.status(StatusCodes.OK).send(responseCustom);
  } catch (error) {
    // console.error("Cities could not be recovered: ", error.message);
    return next(error);
  }
};

/**
 * Get list - autocomplete
 * @return {object} Response contains: statuscode (integer), json (objeto): data Cities. Or if there's error, json (objeto): status, code, detail
 */
exports.getAutocomplete = async (req, res, next) => {
  try {
    const objPage = await validator.vWebGetAutocomplete({
      q: req.query.q ? req.query.q : undefined,
      number: req.query.page ? parseInt(req.query.page.number) : null,
      size: req.query.page ? parseInt(req.query.page.size) : null,
    });

    const citiesInDb = await db.City.findAndCountAll({
      where: Sequelize.where(Sequelize.fn("LOWER", Sequelize.col("city")), {
        [Op.like]: "%" + objPage.q + "%",
      }),
      limit: objPage.size,
      offset: (objPage.number - 1) * objPage.size,
      order: [["city", "ASC"]],
      attributes: {
        exclude: ["deletedAt"],
      },
    });

    if (citiesInDb.count <= 0) {
      throw {
        status: StatusCodes.NOT_FOUND,
        message: "Cities not found",
      };
    }
    if (citiesInDb.rows.length <= 0) {
      throw {
        status: StatusCodes.BAD_REQUEST,
        message: '"page.number" is too large for the number of possible pages',
      };
    }
    const totalPages = Math.ceil(citiesInDb.count / objPage.size);

    const responseCustom = {
      meta: {
        page: objPage.number,
        pageSize: objPage.size,
        totalRecords: citiesInDb.count,
        totalPages: totalPages,
      },
      data: citiesInDb.rows,
    };

    return res.status(StatusCodes.OK).send(responseCustom);
  } catch (error) {
    // console.error("Cities could not be recovered: ", error.message);
    return next(error);
  }
};

/**
 * Destroy a City (soft delete)
 * @return {object} Response contains: statuscode (integer), json (objeto): id. Or if there's error, json (objeto): status, code, detail
 */
exports.postDelete = async (req, res, next) => {
  try {
    const { id } = await validator.vWebPostDelete(req.body);
    const citiesInDb = await db.City.findByPk(id, {
      include: [
        {
          model: db.TransportRoute,
          as: "originName",
          attributes: ["origin"],
        },
        {
          model: db.TransportRoute,
          as: "destinationName",
          attributes: ["destination"],
        },
      ],
      attributes: ["id"],
      paranoid: true,
    });

    if (citiesInDb === null) {
      throw {
        status: StatusCodes.NOT_FOUND,
        message: `City does not exist`,
      };
    }

    if (
      citiesInDb.originName.length != 0 &&
      citiesInDb.destinationName.length != 0
    )
      throw {
        status: StatusCodes.UNPROCESSABLE_ENTITY,
        message: `City has related transport routes`,
      };

    await citiesInDb.destroy();

    return res.status(StatusCodes.OK).json({
      meta: null,
      data: { id },
    });
  } catch (error) {
    // console.error("City could not be deleted: ", error.message);
    return next(error);
  }
};
