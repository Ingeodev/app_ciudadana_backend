const { StatusCodes } = require("http-status-codes");
const db = require("../../../../../models/index");
const validator = require("../../../utils/validators/web/routeTimetables.js");
const { Op, Sequelize } = require("sequelize");

/**
 * Create a route timetable
 * @param {object} req - Object containing the date, routeId, companyId
 * @return {object} Response contains: statuscode (integer), json (objeto): echo reply, if 200OK. Or if there's error, json (objeto): status, code, detail
 */
exports.postRegister = async (req, res, next) => {
  try {
    const { date, routeId, companyId } = await validator.vWebPostRegister({
      date: req.body.date,
      routeId: req.body.routeId,
      companyId: req.body.companyId,
    });

    // Verify whether the route belongs to the companyId
    const companyInDb = await db.TransportCompany.findOne({
      where: { id: companyId },
      include: [
        {
          model: db.TransportRoute,
          where: { id: routeId },
          attributes: ["id"],
        },
      ],
    });

    if (!companyInDb || companyInDb.TransportRoutes.length === 0) {
      throw {
        message: "The company does not have a date on the route indicated.",
        status: StatusCodes.UNPROCESSABLE_ENTITY,
      };
    }

    const dataQuery = {
      date,
      routeId,
    };

    const result = await db.RouteTimetable.create(dataQuery);
    delete result.dataValues.deletedAt;
    result.dataValues.day = new Date(date).getDay();
    return res.status(StatusCodes.CREATED).json({ meta: null, data: result });
  } catch (error) {
    // console.error("Route timetable could not be created: ", error.message);
    return next(error);
  }
};

/**
 * Create a route timetable with your hours
 * @param {object} req - Object containing the date, routeId, companyId, hours (array)
 * @return {object} Response contains: statuscode (integer), json (objeto): echo reply, if 200OK. Or if there's error, json (objeto): status, code, detail
 */
exports.postRegisterWithHour = async (req, res, next) => {
  const transaction = await db.sequelize.transaction();
  try {
    const { date, routeId, companyId, hoursTariffs } = await validator.vWebPostRegisterWithHour(req.body);

    // Verify whether the route belongs to the companyId
    const companyInDb = await db.TransportCompany.findOne({
      where: { id: companyId },
      include: [
        {
          model: db.TransportRoute,
          where: { id: routeId },
          attributes: ["id"],
        },
      ],
    });

    if (!companyInDb || companyInDb.TransportRoutes.length === 0) {
      throw {
        message: "The company does not have a date on the route indicated.",
        status: StatusCodes.UNPROCESSABLE_ENTITY,
      };
    }

    const dataQuery = {
      date,
      routeId,
    };

    let result = await db.RouteTimetable.create(dataQuery, { transaction });
    delete result.dataValues.deletedAt;
    result.dataValues.day = new Date(date).getDay();

    // Record hours and tariffs
    const updatedHoursTariffs = hoursTariffs.map((item) => ({
      ...item,
      timetableId: result.dataValues.id,
    }));
    const resultHours = await db.RouteTimetableHourTariff.bulkCreate(updatedHoursTariffs, { transaction });
    
    const updatedHourTariffs = resultHours.map((item) => ({
      id: item.dataValues.id,
      hour: item.dataValues.hour.substring(0, 5), // We take only the first 5 characters of the string "hh:mm:ss".
      tariff: item.dataValues.tariff,
      timetableId: item.dataValues.timetableId,
      createdAt: item.dataValues.createdAt,
      updatedAt: item.dataValues.updatedAt,
      deletedAt: undefined,
    }));

    result.dataValues.hourTariffs = updatedHourTariffs;
    await transaction.commit();    
    return res.status(StatusCodes.CREATED).json({ meta: null, data: result });
  } catch (error) {
    // console.error("Route timetable could not be created: ", error.message);
    await transaction.rollback();
    return next(error);
  }
};

/**
 * Update a route timetable
 * @param {object} req - Object containing the id, date, routeId, companyId
 * @return {object} Response contains: statuscode (integer), json (route timetable object updated) if 200OK. Or if there's error, json (objeto): status, code, detail
 */
exports.postEdit = async (req, res, next) => {
  try {
    const { id, date, routeId, companyId } = await validator.vWebPostEdit({
      id: req.body.id,
      date: req.body.date,
      routeId: req.body.routeId,
      companyId: req.body.companyId,
    });

    // Verify whether the route belongs to the companyId
    const companyInDb = await db.TransportCompany.findOne({
      where: { id: companyId },
      include: [
        {
          model: db.TransportRoute,
          where: { id: routeId },
          attributes: ["id"],
        },
      ],
    });

    if ( !companyInDb || companyInDb.TransportRoutes.length === 0 ) {
      throw {
        message: "The company does not have a date on the route indicated.",
        status: StatusCodes.UNPROCESSABLE_ENTITY,
      };
    }

    const dataQuery = {
      date,
    };

    const timetableInDb = await db.RouteTimetable.findOne({
      where: {
        id,
        routeId
      }
    });

    if (timetableInDb === null) {
      throw {
        status: StatusCodes.NOT_FOUND,
        message: `Route timetable does not exist`,
      };
    }

    const resultUpdate = await timetableInDb.update(dataQuery);
    delete resultUpdate.dataValues.deletedAt;
    resultUpdate.dataValues.day = new Date(date).getDay();
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
 * Get all  Route timetables
 * @return {object} Response contains: statuscode (integer), json (objeto): data Route timetables. Or if there's error, json (objeto): status, code, detail
 */
exports.getAll = async (req, res, next) => {
  try {
    const objPage = await validator.vWebGetAll({
      companyId: req.query.companyId ? parseInt(req.query.companyId) : null,
      routeId: req.query.routeId ? parseInt(req.query.routeId) : null,
      number: req.query.page ? parseInt(req.query.page.number) : null,
      size: req.query.page ? parseInt(req.query.page.size) : null,
    });

    // Verify whether the route belongs to the companyId
    // ! Hacer una sola busqueda
    const companyInDb = await db.TransportRoute.findOne({
      where: {
        id: objPage.routeId,
        companyId: objPage.companyId,
      },
      attributes: ["id"],
    });

    if (companyInDb == null || companyInDb.id == null)
      throw {
        message: "Transport company not found.",
        status: StatusCodes.NOT_FOUND,
      };

    const timetablesInDb = await db.RouteTimetable.findAndCountAll({
      where: { routeId: objPage.routeId },
      limit: objPage.size,
      offset: (objPage.number - 1) * objPage.size,
      order: [["date", "ASC"]],
      attributes: {
        exclude: ["deletedAt"],
      },
      paranoid: true
    });

    if (timetablesInDb.count <= 0) {
      throw {
        status: StatusCodes.NOT_FOUND,
        message: "There are no route timetables registered",
      };
    }
    if (timetablesInDb.rows.length <= 0) {
      throw {
        status: StatusCodes.BAD_REQUEST,
        message: '"page.number" is too large for the number of possible pages',
      };
    }
    const totalPages = Math.ceil(timetablesInDb.count / objPage.size);

    timetablesInDb.rows = timetablesInDb.rows.map((timetable) => {
      return {
        ...timetable.dataValues,
        day: new Date(timetable.date).getDay(),
        deletedAt: undefined,
      };
    });

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
 * Destroy a Route timetable (soft delete)
 * @return {object} Response contains: statuscode (integer), json (objeto): id. Or if there's error, json (objeto): status, code, detail
 */
exports.postDelete = async (req, res, next) => {
  try {
    const { id, routeId, companyId } = await validator.vWebPostDelete(req.body);

    // Verify whether the route belongs to the companyId
    const companyInDb = await db.TransportCompany.findOne({
      where: { id: companyId },
      include: [
        {
          model: db.TransportRoute,
          where: { id: routeId },
          attributes: ["id"],
        },
      ],
    });

    if (!companyInDb || companyInDb.TransportRoutes.length === 0) {
      throw {
        message: "The company does not have a date on the route indicated.",
        status: StatusCodes.UNPROCESSABLE_ENTITY,
      };
    }

    const timetablesInDb = await db.RouteTimetable.findOne({
      where: {
        id,
        routeId,
      },
      attributes: ["id"],
      paranoid: true,
    });

    if (timetablesInDb === null) {
      throw {
        status: StatusCodes.NOT_FOUND,
        message: `Route timetable does not exist`,
      };
    }

    await timetablesInDb.destroy();

    return res.status(StatusCodes.OK).json({
      meta: null,
      data: { id, routeId },
    });
  } catch (error) {
    // console.error("Route timetable could not be deleted: ", error.message);
    return next(error);
  }
};
