const { StatusCodes } = require("http-status-codes");
const db = require("../../../../../models/index");
const validator = require("../../../utils/validators/web/routeTimetablesHourTariff.js");

/**
 * Create a hour n tariff for a route timetable
 * @param {object} req - Object containing the hour, tariff, timetableId
 * @return {object} Response contains: statuscode (integer), json (objeto): echo reply, if 200OK. Or if there's error, json (objeto): status, code, detail
 */
exports.postRegister = async (req, res, next) => {
  try {
    const { hour, tariff, timetableId } = await validator.vWebPostRegister(req.body);

    // Verify whether the hour n tariff belongs to the timetableId
    const rTimetableInDb = await db.RouteTimetable.findOne({
      where: {
        id: timetableId,
      },
      attributes: ["id"],
    });

    if (rTimetableInDb == null || rTimetableInDb.id == null)
      throw {
        message: "Route timetable not found.",
        status: StatusCodes.NOT_FOUND,
      };

    const dataQuery = {
      hour,
      tariff,
      timetableId,
    };

    const result = await db.RouteTimetableHourTariff.create(dataQuery);
    delete result.dataValues.deletedAt;
    return res.status(StatusCodes.CREATED).json({ meta: null, data: result });
  } catch (error) {
    // console.error("Route timetable could not be created: ", error.message);
    return next(error);
  }
};

/**
 * Update a hour n tariff for a route timetable
 * @param {object} req - Object containing the id, hour, tariff, timetableId
 * @return {object} Response contains: statuscode (integer), json (hour n tariff (object updated) for a route timetable) if 200OK. Or if there's error, json (objeto): status, code, detail
 */
exports.postEdit = async (req, res, next) => {
  try {
    const { id, hour, tariff, timetableId } = await validator.vWebPostEdit(req.body);

    // Verify whether the hour n tariff belongs to the timetableId
    // ! hacer una sola busqueda
    const rTimetableInDb = await db.RouteTimetable.findOne({
      where: {
        id: timetableId,
      },
      attributes: ["id"],
    });

    if (rTimetableInDb == null || rTimetableInDb.id == null)
      throw {
        message: "Route timetable not found.",
        status: StatusCodes.NOT_FOUND,
      };

    const dataQuery = {
      hour,
      tariff,
    };

    const timetableInDb = await db.RouteTimetableHourTariff.findByPk(id);

    if (timetableInDb === null) {
      throw {
        status: StatusCodes.NOT_FOUND,
        message: `Hour n Tariff of Route timetable does not exist`,
      };
    }

    const resultUpdate = await timetableInDb.update(dataQuery);
    delete resultUpdate.dataValues.deletedAt;
    return res.status(StatusCodes.OK).json({
      meta: null,
      data: resultUpdate,
    });
  } catch (error) {
    // console.error("Route timetable could not be updated: ", error.message);
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
 * Get all  - hour n tariff for a route timetable
 * @return {object} Response contains: statuscode (integer), json (objeto): data (hour n tariff) Route timetables. Or if there's error, json (objeto): status, code, detail
 */
exports.getAll = async (req, res, next) => {
  try {
    const objPage = await validator.vWebGetAll({
      timetableId: req.query.timetableId ? parseInt(req.query.timetableId) : null,
      number: req.query.page ? parseInt(req.query.page.number) : null,
      size: req.query.page ? parseInt(req.query.page.size) : null,
    });

    // ! Verify whether the hour n tariff belongs to the companyId
    const timetablesInDb = await db.RouteTimetableHourTariff.findAndCountAll({
      where: { timetableId: objPage.timetableId },
      limit: objPage.size,
      offset: (objPage.number - 1) * objPage.size,
      order: [["hour", "ASC"]],
      attributes: {
        exclude: ["deletedAt"],
      },
      paranoid: true,
    });

    if (timetablesInDb.count <= 0) {
      throw {
        status: StatusCodes.NOT_FOUND,
        message: "There are no hour n tariff registered",
      };
    }
    if (timetablesInDb.rows.length <= 0) {
      throw {
        status: StatusCodes.BAD_REQUEST,
        message: '"page.number" is too large for the number of possible pages',
      };
    }
    const totalPages = Math.ceil(timetablesInDb.count / objPage.size);

    const responseCustom = {
      meta: {
        page: objPage.number,
        pageSize: objPage.size,
        totalRecords: timetablesInDb.count,
        totalPages: totalPages,
      },
      data: timetablesInDb.rows,
    };

    return res.status(StatusCodes.OK).send(responseCustom);
  } catch (error) {
    // console.error("Route timetables could not be recovered: ", error.message);
    return next(error);
  }
};

/**
 * Destroy a hour n tariff for a route timetable (soft delete)
 * @return {object} Response contains: statuscode (integer), json (objeto): id. Or if there's error, json (objeto): status, code, detail
 */
exports.postDelete = async (req, res, next) => {
  try {
    const { id, timetableId } = await validator.vWebPostDelete(req.body);
    const timetablesInDb = await db.RouteTimetableHourTariff.findOne({
      where: {
        id,
        timetableId
      },
      attributes: ["id"],
      paranoid: true,
    });

    if (timetablesInDb === null) {
      throw {
        status: StatusCodes.NOT_FOUND,
        message: `Hour n tariff for a route timetable does not exist`,
      };
    }

    await timetablesInDb.destroy();

    return res.status(StatusCodes.OK).json({
      meta: null,
      data: { id },
    });
  } catch (error) {
    // console.error("Hour n tariff for a route timetabe could not be deleted: ", error.message);
    return next(error);
  }
};
