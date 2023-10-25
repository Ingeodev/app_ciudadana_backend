const { StatusCodes } = require("http-status-codes");
const { Op } = require("sequelize");
const { readFile } = require("fs");
const { resolve, join } = require("path");
const { parse } = require("node-xlsx");
const db = require("../../../../../models/index.js");
const validator = require("../../../utils/validators/web/transportRoutes.js");
const formathhmm = require("../../../utils/formatHH_MM.js")
const constant = require("../../../constant.json");
const caliCityCode = constant.CALI_CITY_CODE;
const templateRoutesXlsx = constant.TEMPLATE_TRANSPORT_ROUTES;

/**
 * Checks whether an TransportCompany ID exists.
 * @param {number} companyId The ID of an TransportCompany, or ``null``.
 * @returns {boolean} `true` if the `companyId` is `null` or exists in the TransportCompany table. ``false`` otherwise.
 */
const checkCompanyExists = async (companyId) => {
  if (companyId != null) {
    const companyInDb = await db.TransportCompany.findByPk(companyId, { attributes: ['id'], paranoid: true });
    if (companyInDb == null)
      return false;
  }
  return true;
};

/**
 * Create an transport route
 * @param {Array} req.body - Object containing the origin, destination, companyId, duration
 * @return {object} Response contains: statusCode (integer), json (objects array): id, origin, destination, companyId, if 200OK. Or if there's error, json (object): status, code, detail
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

    const { originId, destinationId, companyId, duration } =
      await validator.vWebPostRegister(req.body);

    const originInDb = await db.City.findByPk(originId, {
      attributes: ["id", "cityCode"],
    });

    if (originInDb === null) {
      throw {
        message: "City of origin not found",
        status: StatusCodes.UNPROCESSABLE_ENTITY,
      };
    }

    const destinationInDb = await db.City.findByPk(destinationId, {
      attributes: ["id", "cityCode"],
    });

    if (destinationInDb === null) {
      throw {
        message: "City of destination not found",
        status: StatusCodes.UNPROCESSABLE_ENTITY,
      };
    }

    if (
      originInDb.dataValues.cityCode !== caliCityCode &&
      destinationInDb.dataValues.cityCode !== caliCityCode
    ) {
      throw {
        message: "Only routes to and from Cali, Valle del Cauca are allowed.",
        status: StatusCodes.UNPROCESSABLE_ENTITY,
      };
    }

    if (
      originInDb.dataValues.cityCode === destinationInDb.dataValues.cityCode
    ) {
      throw {
        message: "Origin and destination are the same.",
        status: StatusCodes.UNPROCESSABLE_ENTITY,
      };
    }

    // Validate that the transport company belongs to the user.
    if (!(await checkCompanyExists(companyId)))
      throw {
        status: StatusCodes.NOT_FOUND,
        message: "The transport company not found.",
      };

    let result = await db.TransportRoute.create({
      origin: originInDb.dataValues.id,
      destination: destinationInDb.dataValues.id,
      companyId,
      duration: formathhmm.hhmmToSeconds(duration),
      createdBy: createdBy.id,
    });
    delete result.dataValues.deletedAt;
    delete result.dataValues.createdBy;
    result.dataValues.duration = formathhmm.secondsToHhmm(
      result.dataValues.duration
    );
    return res.status(StatusCodes.CREATED).json({ meta: null, data: result });
  } catch (error) {
    // console.error("The transport route could not be created: ", error.message);
    if (error.name === "SequelizeUniqueConstraintError") {
      error.message = "There is a similar transport route that has been previously created.";
      error.status = StatusCodes.BAD_REQUEST;
    }
    return next(error);
  }
};

/**
 * Update a transport route
 * @param {object} req - Object containing the id, origin, destination, companyId, duration
 * @return {object} Response contains: statusCode (integer), json (route object updated) if 200OK. Or if there's error, json (object): status, code, detail
 */
exports.postEdit = async (req, res, next) => {
  try {
    // // ! Pendiente: Validar permisos del usuario
    // const createdBy = await db.User.findOne({
    //   where: { disabled: false, userMobile: false, clientId: res.locals.uid },
    //   attributes: ["id"],
    // });

    // if (createdBy == null || createdBy.id == null)
    //   throw {
    //     message: "User not found.",
    //     status: StatusCodes.NOT_FOUND,
    //   };

    const { id, originId, destinationId, companyId, duration } =
      await validator.vWebPostEdit(req.body);
    
    const originInDb = await db.City.findByPk(originId, {
      attributes: ["id", "cityCode"],
    });

    if (originInDb === null) {
      throw {
        message: "City of origin not found",
        status: StatusCodes.UNPROCESSABLE_ENTITY,
      };
    }

    const destinationInDb = await db.City.findByPk(destinationId, {
      attributes: ["id", "cityCode"],
    });

    if (destinationInDb === null) {
      throw {
        message: "City of destination not found",
        status: StatusCodes.UNPROCESSABLE_ENTITY,
      };
    }

    if (originInDb.dataValues.cityCode !== caliCityCode &&
      destinationInDb.dataValues.cityCode !== caliCityCode) {
      throw {
        message: "Only routes to and from Cali, Valle del Cauca are allowed.",
        status: StatusCodes.UNPROCESSABLE_ENTITY,
      };
    }

    if (originInDb.dataValues.cityCode === destinationInDb.dataValues.cityCode) {
      throw {
        message: "Origin and destination are the same.",
        status: StatusCodes.UNPROCESSABLE_ENTITY,
      };
    }

    // Validate that the transport company belongs to the user.
    if (!(await checkCompanyExists(companyId)))
      throw {
        status: StatusCodes.NOT_FOUND,
        message: "The transport company not found.",
      };

    // Validate that the route belongs to the user
    const routeInDb = await db.TransportRoute.findOne({
      where: {
        id,
        companyId,
      },
    });

    if (routeInDb == null)
      throw {
        message: "Transport route not found",
        status: StatusCodes.NOT_FOUND,
        // status: StatusCodes.UNPROCESSABLE_ENTITY,
      };

    let resultUpdate = await routeInDb.update({
      origin: originInDb.dataValues.id,
      destination: destinationInDb.dataValues.id,
      duration: formathhmm.hhmmToSeconds(duration),
    });
    delete resultUpdate.dataValues.deletedAt;
    delete resultUpdate.dataValues.createdBy;
    resultUpdate.dataValues.duration = formathhmm.secondsToHhmm(resultUpdate.dataValues.duration);

    return res.status(StatusCodes.OK).json({ meta: null, data: resultUpdate });
  } catch (error) {
    // console.error("ThirdParty categories could not be updated: ", error.message);
    if (error.name === 'SequelizeUniqueConstraintError') {
      error.message = "There is a similar transport route that has been previously created.";
      error.status = StatusCodes.BAD_REQUEST;
    } else if (error && error.errors && error.errors.length > 0 && error.errors[0].message) {
        error.message = error.errors[0].message;
    }
    return next(error);
  }
};

/**
 * Destroy a transport route (soft delete)
 * @param {object} req - Object containing the id, companyId
 * @return {object} Response contains: statusCode (integer), json (object): id. Or if there's error, json (object): status, code, detail
 */
exports.postDelete = async (req, res, next) => {
  try {
    // // ! Pendiente: Validar permisos del usuario
    // const createdBy = await db.User.findOne({
    //   where: { disabled: false, userMobile: false, clientId: res.locals.uid },
    //   attributes: ["id"],
    // });

    // if (createdBy == null || createdBy.id == null)
    //   throw {
    //     message: "User not found.",
    //     status: StatusCodes.NOT_FOUND,
    //   };

    const { id, companyId } = await validator.vWebPostDelete(req.body);

    if (!(await checkCompanyExists(companyId)))
      throw {
        status: StatusCodes.NOT_FOUND,
        message: "The transport company not found.",
      };

    // Validate that the route belongs to the transport company
    const routeInDb = await db.TransportRoute.findOne({
      where: {
        id,
        companyId,
      },
      // // ! Es necesario borrar primero los horarios para borrar las rutas?
      // include: [
      //   {
      //     model: db.RouteTimetable,
      //     attributes: ["id"],
      //     required: false,
      //   },
      // ],
      attributes: ["id"],
      paranoid: true,
    });

    if (routeInDb == null)
      throw {
        message: "Transport route not found",
        status: StatusCodes.NOT_FOUND,
        // status: StatusCodes.UNPROCESSABLE_ENTITY,
      };

    await routeInDb.destroy();

    return res.status(StatusCodes.OK).json({
      meta: null,
      data: { id, companyId },
    });
  } catch (error) {
    // console.error("ThirdParty categories could not be deleted: ", error.message);
    return next(error);
  }
};

/**
 * Get all transport routes by company
 * @param {object} req.query - Object containing the companyId, number, and size
 * @param {integer} req.params.id - id of the company
 * @return {object} Response contains: statusCode (integer), json (objeto): data transport companies. Or if there's error, json (objeto): status, code, detail
 */
exports.getAll = async (req, res, next) => {
  try {
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

    const objPage = await validator.vWebGetListRoutes({
      companyId: req.params.companyId ? parseInt(req.params.companyId) : null,
      number: req.query.page ? parseInt(req.query.page.number) : null,
      size: req.query.page ? parseInt(req.query.page.size) : null,
    });

    if (!(await checkCompanyExists(objPage.companyId)))
      throw {
        status: StatusCodes.NOT_FOUND,
        message: "The transport company not found.",
      };

    const companiesInDb = await db.TransportRoute.findAndCountAll({
      // // ! Pendiente: Validar permisos del usuario
      where: {
        companyId: objPage.companyId,
      },
      include: [
        {
          model: db.City,
          as: "originName",
          attributes: ["city"],
        },
        {
          model: db.City,
          as: "destinationName",
          attributes: ["city"],
        },
      ],
      limit: objPage.size,
      offset: (objPage.number - 1) * objPage.size,
      order: [["origin", "ASC"]], // Sort by date of creation in descending order
      attributes: {
        exclude: ["deletedAt", "createdBy"],
      },
    });

    let message = undefined;
    if (companiesInDb.count <= 0)
      message = "There are no registered routes of the transport company";
    if (companiesInDb.rows.length <= 0)
      message = '"page[number]" is too large for the number of possible pages.';

    const transformedCompanies = companiesInDb.rows.map((company) => {
      const companyData = company.get({ plain: true });
      const tOriginName = companyData.originName.city;
      delete companyData.originName;
      const tDestinationName = companyData.destinationName.city;
      delete companyData.destinationName;
      companyData.duration = formathhmm.secondsToHhmm(companyData.duration);

      return {
        ...companyData,
        originName: tOriginName,
        destinationName: tDestinationName,
      };
    });

    return res.status(StatusCodes.OK).json({
      meta: {
        message,
        page: objPage.number,
        pageSize: objPage.size,
        totalRecords: companiesInDb.count,
        totalPages: Math.ceil(companiesInDb.count / objPage.size),
      },
      data: transformedCompanies,
    });
  } catch (error) {
    // console.error("Transport routes could not be recovered: ", error.message);
    return next(error);
  }
};

/**
 * Get all transport companies with your routes
 * @param {object} req.query - Object containing the number and size
 * @return {object} Response contains: statusCode (integer), json (objeto): data transport companies. Or if there's error, json (objeto): status, code, detail
 */
exports.getCompaniesNRoutes = async (req, res, next) => {
  try {
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

    const objPage = await validator.vWebGetListCompaniesNRoutes({
      number: req.query.page ? parseInt(req.query.page.number) : null,
      size: req.query.page ? parseInt(req.query.page.size) : null,
    });

    const companiesInDb = await db.TransportCompany.findAndCountAll({
      // // ! Pendiente: Validar permisos del usuario
      // where: { createdBy: createdBy.id },
      limit: objPage.size,
      offset: (objPage.number - 1) * objPage.size,
      order: [["name", "ASC"]], // Sort by date of creation in descending order
      include: [
        {
          model: db.TransportRoute,
          attributes: ["id", "origin", "destination", "duration"],
          required: false,
        },
      ],
      attributes: [
        "id",
        "name",
        "nit",
        "description",
        "phone",
        "siteUri",
        "imageUri",
        // ["imageUri", "image"],
        // [Sequelize.col("imageUri"), "image"],
      ],
    });

    let message = undefined;
    if (companiesInDb.count <= 0)
      message = "There are no transport companies registered";
    if (companiesInDb.rows.length <= 0)
      message = '"page[number]" is too large for the number of possible pages.';

    const transformedCompanies = companiesInDb.rows.map((company) => {
      const companyData = company.get({ plain: true });
      const routes = companyData.TransportRoutes.map((obj) => ({
        id: obj.id,
        origin: obj.origin,
        destination: obj.destination,
        duration: formathhmm.secondsToHhmm(obj.duration),
      }));
      delete companyData.TransportRoutes;

      return {
        ...companyData,
        routes,
      };
    });

    return res.status(StatusCodes.OK).json({
      meta: {
        message,
        page: objPage.number,
        pageSize: objPage.size,
        totalRecords: companiesInDb.count,
        totalPages: Math.ceil(companiesInDb.count / objPage.size),
      },
      data: transformedCompanies,
    });
  } catch (error) {
    // console.error("Transport companies could not be recovered: ", error.message);
    return next(error);
  }
};

/**
 * Get all route timetables of an route
 * @param {object} req.query - Object containing the number and size
 * @return {object} Response contains: statusCode (integer), json (objeto): data transport companies. Or if there's error, json (objeto): status, code, detail
 */
exports.getItinerary = async (req, res, next) => {
  try {
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

    const objPage = await validator.vWebGetItinerary({
      routeId: req.query.routeId ? parseInt(req.query.routeId) : null,
      // number: req.query.page ? parseInt(req.query.page.number) : null,
      // size: req.query.page ? parseInt(req.query.page.size) : null,
    });

    let routeInDb = await db.TransportRoute.findByPk(objPage.routeId, {
      // // ! Pendiente: Validar permisos del usuario
      // where: { createdBy: createdBy.id },
      include: [
        {
          model: db.RouteTimetable,
          where: { date: { [Op.gte]: new Date() } },
          include: [
            {
              model: db.RouteTimetableHourTariff,
              attributes: ["id", "timetableId", "hour", "tariff"],
              required: false,
            },
          ],
          attributes: ["id", "date", "routeId"],
          required: false,
        },
      ],
      attributes: [
        "id",
        "origin",
        "destination",
        "companyId",
        "duration",
        // ["imageUri", "image"],
        // [Sequelize.col("imageUri"), "image"],
      ],
      order: [
        [db.RouteTimetable, "date", "ASC"],
        [db.RouteTimetable, db.RouteTimetableHourTariff, "hour", "ASC"],
      ],
    });

    if (routeInDb == null)
      throw {
        message: "Route could not be retrieved",
        status: StatusCodes.NOT_FOUND,
        // status: StatusCodes.UNPROCESSABLE_ENTITY,
      };
    
    routeInDb.duration = formathhmm.secondsToHhmm(routeInDb.duration);
    routeInDb.RouteTimetables.forEach((timetable) => {
      if (timetable.RouteTimetableHourTariffs) {
        timetable.RouteTimetableHourTariffs.forEach((hourTariff) => {
          if (hourTariff.hour) {
            hourTariff.hour = hourTariff.hour.substring(0, 5);
          }
        });
      }
    });

    const responseCustom = {
      meta: null,
      data: routeInDb,
    };

    return res.status(StatusCodes.OK).send(responseCustom);
  } catch (error) {
    // console.error("Transport companies could not be recovered: ", error.message);
    return next(error);
  }
};

/**
 * Upload an excel file that will create/update transport routes in the database. This use "template.xlsx". With: originCode, destinationCode, duration, date, hour, tariff
 * @return {object} Response contains: statusCode (integer), json (objeto): meta n data (array of successful and unsuccessful rows). Or if there's error, json (objeto): status, code, detail
 */
exports.postUploadXlsx = async (req, res, next) => {
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

    const xlsxFile = await validator.vMulterMemorySingleItemSchema(req.file);
    const { companyId } = await validator.vWebPostUploadXlsxRoutes(req.body);

    // Verify if the transportation company exists
    const companyInDb = await db.TransportCompany.findByPk(companyId, {
      // // ! Pendiente: Validar permisos del usuario
      // where: { createdBy: createdBy.id },
      attributes: ["id", "name"],
    });

    if (companyInDb === null) {
      throw {
        message: "Transport company not found",
        status: StatusCodes.NOT_FOUND,
      };
    }

    const contents = parse(xlsxFile.buffer);
    let success = [];
    let errors = [];

    // Only one sheet is allowed in the xls
    const namePages = await validator.vRExcelPagesSchema(contents);

    // for (let iPage = 0; iPage < namePages.length; iPage++) {
    // Validate column names
    // await validator.vRExcelHeaderSchema({ header: contents[iPage].data[0] });
    // }
    const iPage = 0;
    let endRow = contents[iPage].data.length;

    // Validation of the first row of each sheet - name of the columns

    for (let row = 1; row < contents[iPage].data.length; row++) {
      let durationUpdated = 1;
      let msgSuccess = "";
      let item = contents[iPage].data[row].slice(0, 6).toString();
      const transaction = await db.sequelize.transaction();

      // Check if there are no more data - check origin, destination, n date
      try {
        if (
          (contents[iPage].data[row][2] === "" &&
            contents[iPage].data[row][3] === "" &&
            contents[iPage].data[row][4] === "") ||
          (contents[iPage].data[row][0] === null &&
            contents[iPage].data[row][1] === null &&
            contents[iPage].data[row][3] === null) ||
          (contents[iPage].data[row][0] === undefined &&
            contents[iPage].data[row][1] === undefined &&
            contents[iPage].data[row][3] === undefined)
        ) {
          endRow = row;
          await transaction.rollback();
          break;
        }

        let originCode = null,
          destinationCode = null,
          duration = null,
          date = null,
          tariff = null,
          hour = null;

        try {
          ({ originCode, destinationCode, duration, date, hour, tariff } =
            await validator.vRExcelRouteSchema({
              originCode: parseInt(contents[iPage].data[row][0]),
              destinationCode: parseInt(contents[iPage].data[row][1]),
              duration: contents[iPage].data[row][2],
              date: contents[iPage].data[row][3],
              hour: contents[iPage].data[row][4],
              tariff: parseInt(contents[iPage].data[row][5]),
            }));
          duration = formathhmm.hhmmToSeconds(duration);
        } catch (error) {
          errors.push(
            `Fila ${row + 1} con campos [${item}]. ${error.message}.`
          );
          await transaction.rollback();
          continue;
        }

        // TODO: Only routes to and from Cali, Valle del Cauca
        if (originCode !== caliCityCode && destinationCode !== caliCityCode) {
          errors.push(
            `Fila ${
              row + 1
            } con campos [${item}]. Solo se permiten rutas desde y hacia Cali, Valle del Cauca.`
          );
          await transaction.rollback();
          continue;
        }
        if (originCode === destinationCode) {
          errors.push(
            `Fila ${
              row + 1
            } con campos [${item}]. El origen y el destino son los mismos.`
          );
          await transaction.rollback();
          continue;
        }

        // -------------------------- Search the origin and destination in the db
        const originInDb = await db.City.findOne({
          // // ! Pendiente: Validar permisos del usuario
          where: { cityCode: originCode },
          attributes: ["id", "city", "state", "cityCode"],
        });

        if (originInDb === null) {
          errors.push(
            `Fila ${
              row + 1
            } con campos [${item}]. Código de municipio de origen (${originCode}) no encontrado.`
          );
          await transaction.rollback();
          continue;
        }

        const destinationInDb = await db.City.findOne({
          // // ! Pendiente: Validar permisos del usuario
          where: { cityCode: destinationCode },
          attributes: ["id", "city", "state", "cityCode"],
        });

        if (destinationInDb === null) {
          errors.push(
            `Fila ${
              row + 1
            } con campos [${item}]. Código de municipio de destino (${destinationCode}) no encontrado.`
          );
          await transaction.rollback();
          continue;
        }

        // -------------------------- Check if the route exists
        let routeInDb = null;
        let tempRouteInDb = null;
        let idRouteInDb = 0;
        routeInDb = await db.TransportRoute.findOne({
          // // ! Pendiente: Validar permisos del usuario
          where: {
            origin: originInDb.dataValues.id,
            destination: destinationInDb.dataValues.id,
            companyId,
          },
          attributes: ["id", "duration"],
          // TODO: This means that the deleted routes will not be revived.
          paranoid: true,
        });

        try {
          if (routeInDb === null) {
            // Create route in db           
            routeInDb = await db.TransportRoute.create(
              {
                createdBy: createdBy.id,
                origin: originInDb.dataValues.id,
                destination: destinationInDb.dataValues.id,
                duration,
                companyId,
              },
              {
                transaction,
              }
            );

            idRouteInDb = routeInDb.dataValues.id;
            msgSuccess += "Ruta creada, ";
          } else {
            if (routeInDb.dataValues.duration !== duration) {
              tempRouteInDb = await routeInDb.update({duration}, {
                transaction,
              });
              idRouteInDb = tempRouteInDb.dataValues.id;
              msgSuccess += "La duración de la ruta actualizada, ";
              durationUpdated = 0;
            } else {
              idRouteInDb = routeInDb.dataValues.id;
              msgSuccess += "La duración de la ruta no actualizada, ";
            }
          }
        } catch (error) {
          await transaction.rollback();
          errors.push(
            `Fila ${
              row + 1
            } con campos [${item}]. Error relacionado con la ruta - origen (${originCode}-${
              originInDb.dataValues.city
            }, ${originInDb.dataValues.state}), destino (${destinationCode}-${
              destinationInDb.dataValues.city
            }, ${destinationInDb.dataValues.state}).`
          );
          continue;
        }

        // -------------------------- Check if the route timetable (date n routeId) exists
        let timetableInDb = null;
        timetableInDb = await db.RouteTimetable.findOne({
          // // ! Pendiente: Validar permisos del usuario
          where: {
            date,
            routeId: idRouteInDb,
          },
          attributes: ["id"],
          // TODO: This means that the deleted routes will not be revived.
          paranoid: true,
        });

        try {
          if (timetableInDb === null) {
            // Create route in db
            timetableInDb = await db.RouteTimetable.create(
              { date, routeId: idRouteInDb },
              {
                transaction,
              }
            );
            msgSuccess += "Fecha creada, ";
          } else {
            msgSuccess += "Fecha no creada, ";
          }
        } catch (error) {
          await transaction.rollback();
          errors.push(
            `Fila ${
              row + 1
            } con campos [${item}]. Error relacionado con la fecha (${date}).`
          );
          continue;
        }

        //--------------------------  Check if the route timetable (hour n tariff) exists
        let hourInDb = null;
        hourInDb = await db.RouteTimetableHourTariff.findOne({
          // // ! Pendiente: Validar permisos del usuario
          where: {
            hour,
            timetableId: timetableInDb.dataValues.id,
          },
          attributes: ["id", "tariff"],
          // TODO: This means that the deleted routes will not be revived.
          paranoid: true,
        });

        try {
          if (hourInDb === null) {
            // Create route in db
            hourInDb = await db.RouteTimetableHourTariff.create(
              { hour, tariff, timetableId: timetableInDb.dataValues.id },
              {
                transaction,
              }
            );

            msgSuccess += "Hora y Tarifa creadas";
          } else {
            if (String(hourInDb.dataValues.tariff) === String(tariff)) {
              errors.push(
                `Fila ${
                  row + 1
                } con campos [${item}]. La hora (${hour}) y tarifa (${tariff}) existen.`
              );

              if (durationUpdated === 0) {
                await transaction.commit();
                msgSuccess += "La tarifa de la hora no actualizada";
                success.push(`Fila ${row + 1} con campos [${item}]. ${msgSuccess}.`);
                continue;
              }
              await transaction.rollback();
              continue;
            }

            await hourInDb.update({tariff}, {
              transaction,
            });
            msgSuccess += "La tarifa de la hora actualizada";
          }
          await transaction.commit();
          success.push(`Fila ${row + 1} con campos [${item}]. ${msgSuccess}.`);
        } catch (error) {
          await transaction.rollback();
          errors.push(
            `Fila ${
              row + 1
            } con campos [${item}]. Error relacionado con la hora (${hour}) y tarifa (${tariff}).`
          );
          continue;
        }
        // -------------------------- End Row
      } catch (error) {
        await transaction.rollback();
        errors.push(
          `Fila ${row + 1} con campos [${item}]. Error en el servidor.`
        );
        // console.log("error.message");
        // console.log(JSON.stringify(error));
        continue;
      }
    } // End for - End Excel rows

    // Create/Add route timetable
    // const routesInDb = await db.RouteTimetable.bulkCreate(routesTimetables, {
    //   fields: ["id", "date", "startTime", "routeId", "tariff", "duration"],
    //   updateOnDuplicate: [
    //     "startTime",
    //     "tariff",
    //     "duration",
    //     "updatedAt",
    //     "deletedAt",
    //   ],
    //   validate: true,
    //   transaction,
    // });

    // const returnRoutes = routesInDb.map((obj) => {
    //   return { ...obj.dataValues, deletedAt: undefined };
    // });

    let resJSON = {
      meta: {
        page: 1,
        // pageSize: resJSON.routes.length,
        // totalRecords: resJSON.routes.length,
        totalPages: 1,
        companyId,
        companyName: companyInDb.dataValues.name,
        numRows: endRow - 1,
        numErrors: errors.length,
        numSuccess: success.length,
        // lastRowProcessedOfFile: endRow,
      },
      data: {
        success,
        errors,
      },
    };
    return res.status(StatusCodes.CREATED).json(resJSON);
  } catch (error) {
    return next(error);
  }
};

/**
 * Download the template to create new transport routes.
 * @return {object} Response contains: statusCode (integer), file. Or if there's error, json (objeto): status, code, detail
 */
exports.getDownloadXlsxTemplate = async (req, res, next) => {
  try {
    const downloadPath = resolve(join(".", "static", templateRoutesXlsx));

    // const fileBuffer = fs.readFile(downloadPath);
    readFile(downloadPath, (err, fileBuffer) => {
      if (err) {
        console.error(err);
        return next({
          status: StatusCodes.INTERNAL_SERVER_ERROR,
          message: "The excel template has not been loaded.",
        });
      }

      res.setHeader(
        "Content-Disposition",
        `attachment; filename=${templateRoutesXlsx}`
      );
      res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      );

      // Enviar el buffer
      return res.status(StatusCodes.OK).end(fileBuffer);
    });

    // res.setHeader('Content-Disposition', `attachment; filename=${templateRoutesXlsx}`);
    // res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    // return res.status(StatusCodes.OK).sendFile(downloadPath);
    // return res.status(StatusCodes.OK).send(fileBuffer);
  } catch (error) {
    console.error(error);
    return next({
      status: StatusCodes.INTERNAL_SERVER_ERROR,
      message: "The excel template has not been loaded.",
    });
  }
};
