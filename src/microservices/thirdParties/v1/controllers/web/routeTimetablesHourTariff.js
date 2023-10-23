const { StatusCodes } = require("http-status-codes");
const db = require("../../../../../models/index");
const validator = require("../../../utils/validators/web/routeTimetablesHourTariff.js");

/**
 * Create a hour n tariff for a route timetable
 * @param {object} req.body - Object containing the hour, tariff, timetableId
 * @return {object} Response contains: statusCode (integer), json (objeto): echo reply, if 200OK. Or if there's error, json (objeto): status, code, detail
 */
exports.postRegister = async (req, res, next) => {
  try {
    const { hour, tariff, timetableId, companyId, routeId } = await validator.vWebPostRegister(req.body);

    const companyInDb = await db.TransportCompany.findOne({
      where: { id: companyId },
      include: [
        {
          model: db.TransportRoute,
          where: { id: routeId },
          include: [
            {
              model: db.RouteTimetable,
              where: { id: timetableId },
            },
          ],
        },
      ],
    });

    if (!companyInDb || companyInDb.TransportRoutes.length === 0 || companyInDb.TransportRoutes[0].RouteTimetables.length === 0) {
      throw {
        message: "The company does not have a date on the route indicated.",
        status: StatusCodes.UNPROCESSABLE_ENTITY,
      };
    }

    const dataQuery = {
      hour,
      tariff,
      timetableId,
    };

    const result = await db.RouteTimetableHourTariff.create(dataQuery);
    delete result.dataValues.deletedAt;
    result.dataValues.hour =result.dataValues.hour.substring(0, 5);
    return res.status(StatusCodes.CREATED).json({ meta: null, data: result });
  } catch (error) {
    // console.error("Route timetable could not be created: ", error.message);
    if (error.name === "SequelizeUniqueConstraintError") {
      error.message = "The date (of transport route) has been assigned that hour/tariff.";
      error.status = StatusCodes.BAD_REQUEST;
    } 
    return next(error);
  }
};

/**
 * Update a hour n tariff for a route timetable
 * @param {object} req.body - Object containing the id, hour, tariff, timetableId
 * @return {object} Response contains: statusCode (integer), json (hour n tariff (object updated) for a route timetable) if 200OK. Or if there's error, json (objeto): status, code, detail
 */
exports.postEdit = async (req, res, next) => {
  try {
    // ! Por seguridad se deberia de pedir, companyId y routeId
    const { id, hour, tariff, timetableId, companyId, routeId } = await validator.vWebPostEdit(req.body);

    // Verify whether the hour n tariff belongs to the timetableId
    const companyInDb = await db.TransportCompany.findOne({
      where: { id: companyId },
      include: [
        {
          model: db.TransportRoute,
          where: { id: routeId },
          include: [
            {
              model: db.RouteTimetable,
              where: { id: timetableId },
            },
          ],
        },
      ],
    });

    if (
      !companyInDb ||
      companyInDb.TransportRoutes.length === 0 ||
      companyInDb.TransportRoutes[0].RouteTimetables.length === 0
    ) {
      throw {
        message: "The company does not have a date on the route indicated.",
        status: StatusCodes.UNPROCESSABLE_ENTITY,
      };
    }

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
    resultUpdate.dataValues.hour = resultUpdate.dataValues.hour.substring(0, 5);
    return res.status(StatusCodes.OK).json({
      meta: null,
      data: resultUpdate,
    });
  } catch (error) {
    // console.error("Route timetable could not be updated: ", error.message);
    if (error.name === 'SequelizeUniqueConstraintError') {
      error.message = "The date (of transport route) has been assigned that hour/tariff.";
      error.status = StatusCodes.BAD_REQUEST;
    } else if (error && error.errors && error.errors.length > 0 && error.errors[0].message) {
        error.message = error.errors[0].message;
    }
    return next(error);
  }
};

/**
 * Get all  - hour n tariff for a route timetable
 * @param {object} req.query - Object containing the number, size, companyId, n routeId
 * @return {object} Response contains: statusCode (integer), json (objeto): data (hour n tariff) Route timetables. Or if there's error, json (objeto): status, code, detail
 */
exports.getAll = async (req, res, next) => {
  try {
    const objPage = await validator.vWebGetAll({
      companyId: req.query.companyId ? parseInt(req.query.companyId) : null,
      routeId: req.query.routeId ? parseInt(req.query.routeId) : null,
      timetableId: req.query.timetableId ? parseInt(req.query.timetableId) : null,
      number: req.query.page ? parseInt(req.query.page.number) : null,
      size: req.query.page ? parseInt(req.query.page.size) : null,
    });

    // Verify whether the hour n tariff belongs to the timetableId
    const companyInDb = await db.TransportCompany.findOne({
      where: { id: objPage.companyId },
      include: [
        {
          model: db.TransportRoute,
          where: { id: objPage.routeId },
          include: [
            {
              model: db.RouteTimetable,
              where: { id: objPage.timetableId },
            },
          ],
        },
      ],
    });

    if (
      !companyInDb ||
      companyInDb.TransportRoutes.length === 0 ||
      companyInDb.TransportRoutes[0].RouteTimetables.length === 0
    ) {
      throw {
        message: "The company does not have a date on the route indicated.",
        status: StatusCodes.UNPROCESSABLE_ENTITY,
      };
    }

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

    let message = undefined;
    if (timetablesInDb.count <= 0)
      message = "There are no hour n tariff registered";
    if (timetablesInDb.rows.length <= 0)
      message = '"page[number]" is too large for the number of possible pages.';

    const transformedTimetables = timetablesInDb.rows.map((timetable) => {
      const timetableData = timetable.get({ plain: true }); // Convert Sequelize instance to simple object
      timetableData.hour = timetableData.hour.substring(0, 5);
      return timetableData;
    });

    return res.status(StatusCodes.OK).json({
      meta: {
        message,
        page: objPage.number,
        pageSize: objPage.size,
        totalRecords: timetablesInDb.count,
        totalPages: Math.ceil(timetablesInDb.count / objPage.size),
      },
      data: transformedTimetables,
    });
  } catch (error) {
    // console.error("Route timetables could not be recovered: ", error.message);
    return next(error);
  }
};

/**
 * Destroy a hour n tariff for a route timetable (soft delete)
 * @param {object} req.body - Object containing the id, timetableId, routeId, companyId
 * @return {object} Response contains: statusCode (integer), json (objeto): id. Or if there's error, json (objeto): status, code, detail
 */
exports.postDelete = async (req, res, next) => {
  try {
    const { id, timetableId, companyId, routeId } = await validator.vWebPostDelete(req.body);

    // Verify whether the hour n tariff belongs to the timetableId
    const companyInDb = await db.TransportCompany.findOne({
      where: { id: companyId },
      include: [
        {
          model: db.TransportRoute,
          where: { id: routeId },
          include: [
            {
              model: db.RouteTimetable,
              where: { id: timetableId },
            },
          ],
        },
      ],
    });

    if (!companyInDb || companyInDb.TransportRoutes.length === 0 || companyInDb.TransportRoutes[0].RouteTimetables.length === 0) {
      throw {
        message: "The company does not have a date on the route indicated.",
        status: StatusCodes.UNPROCESSABLE_ENTITY,
      };
    }

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
      data: { id, timetableId, companyId, routeId },
    });
  } catch (error) {
    // console.error("Hour n tariff for a route timetable could not be deleted: ", error.message);
    return next(error);
  }
};
