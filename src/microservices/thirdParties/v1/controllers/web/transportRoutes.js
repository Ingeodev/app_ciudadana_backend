const { StatusCodes } = require("http-status-codes");
const xlsx = require("node-xlsx");
const db = require("../../../../../models/index.js");
const validator = require("../../../utils/validators/web/transportRoutes.js");
const formathhmm = require("../../../utils/formatHH_MM.js")
const caliCodeDane = 76001;

/**
 * Create an transport route
 * @param {Array} req.body - Object containing the origin, destination, companyId, duration
 * @return {object} Response contains: statuscode (integer), json (objects array): id, origin, destination, companyId, if 200OK. Or if there's error, json (object): status, code, detail
 */
exports.postRegister = async (req, res, next) => {
  try {
    // ! Pendiente: Validar permisos del usuario
    const createdBy = await db.User.findOne({
      where: { disabled: false, userMobile: false, clientId: res.locals.uid },
      attributes: ["id"],
    });f

    if (createdBy == null || createdBy.id == null)
      throw {
        message: "User not found.",
        status: StatusCodes.NOT_FOUND,
      };

    const { originId, destinationId, companyId, duration } = await validator.vWebPostRegister(req.body);

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

    if (originInDb.dataValues.cityCode !== caliCodeDane &&
      destinationInDb.dataValues.cityCode !== caliCodeDane) {
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

    // First, validate that the transport company belongs to the user.
    const company = await db.TransportCompany.findOne({
      where: {
        id: companyId,
        createdBy: createdBy.id,
      },
      attributes: ["id"],
    });

    if (company == null || company.id == null)
      throw {
        message: "The transport company not found",
        status: StatusCodes.NOT_FOUND,
        // status: StatusCodes.FORBIDDEN,
      };

    const dataQuery = {
      origin: originInDb.dataValues.cityCode,
      destination: destinationInDb.dataValues.cityCode,
      companyId,
      duration: formathhmm.hhmmToSeconds(duration),
    };

    let result = await db.TransportRoute.create(dataQuery);
    delete result.dataValues.deletedAt;
    delete result.dataValues.createdBy;
    result.dataValues.duration = formathhmm.secondsToHhmm(duration);
    return res.status(StatusCodes.CREATED).json({ meta: null, data: result });
  } catch (error) {
    // console.error("The transport route could not be created: ", error.message);
    return next(error);
  }
};

/**
 * Update a transport route
 * @param {object} req - Object containing the id, origin, destination, companyId, duration
 * @return {object} Response contains: statuscode (integer), json (route object updated) if 200OK. Or if there's error, json (object): status, code, detail
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

    if (originInDb.dataValues.cityCode !== caliCodeDane &&
      destinationInDb.dataValues.cityCode !== caliCodeDane) {
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

    // First, validate that the transport company belongs to the user.
    const companyInDb = await db.TransportCompany.findOne({
      where: {
        id: companyId,
        // createdBy: createdBy.id,
      },
      attributes: ["id"],
    });

    if (companyInDb == null || companyInDb.id == null)
      throw {
        message: "The transport company not found",
        status: StatusCodes.NOT_FOUND,
        // status: StatusCodes.FORBIDDEN,
      };

    // Validate that the route belongs to the user
    const routeInDb = await db.TransportRoute.findOne({
      where: {
        id,
        companyId: companyInDb.id,
      },
    });

    if (routeInDb == null)
      throw {
        message: "Transport route not found",
        status: StatusCodes.NOT_FOUND,
        // status: StatusCodes.UNPROCESSABLE_ENTITY,
      };

    // const routeInDb = await db.ThirdPartyCategory.findByPk(id);

    let resultUpdate = await routeInDb.update({
      origin: originInDb.dataValues.cityCode,
      destination: destinationInDb.dataValues.cityCode,
      duration: formathhmm.hhmmToSeconds(duration),
    });
    delete resultUpdate.dataValues.deletedAt;
    delete resultUpdate.dataValues.createdBy;
    resultUpdate.dataValues.duration = formathhmm.secondsToHhmm(resultUpdate.dataValues.duration);

    return res.status(StatusCodes.OK).json({ meta: null, data: resultUpdate });
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
 * Destroy a transport route (soft delete)
 * @param {object} req - Object containing the id, companyId
 * @return {object} Response contains: statuscode (integer), json (object): id. Or if there's error, json (object): status, code, detail
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

    // First, validate that the transport company belongs to the user.
    const companyInDb = await db.TransportCompany.findOne({
      where: {
        id: companyId,
        // createdBy: createdBy.id,
      },
      attributes: ["id"],
      paranoid: true,
    });

    if (companyInDb == null || companyInDb.id == null)
      throw {
        message: "The transport company not found",
        status: StatusCodes.NOT_FOUND,
        // status: StatusCodes.FORBIDDEN,
      };

    // Validate that the route belongs to the transport company
    const routeInDb = await db.TransportRoute.findOne({
      where: {
        id,
        companyId: companyInDb.id,
      },
      // ! Es necesario borrar primero los horarios para borrar las rutas?
      include: [
        {
          model: db.RouteTimetable,
          attributes: ["id"],
          required: false,
        },
      ],
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
 * Get all transport routes of an company
 * @param {object} req.query - Object containing the companyId, number, and size
 * @return {object} Response contains: statuscode (integer), json (objeto): data transport companies. Or if there's error, json (objeto): status, code, detail
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
      companyId: parseInt(req.params.companyId),
      number: req.query.page ? parseInt(req.query.page.number) : null,
      size: req.query.page ? parseInt(req.query.page.size) : null,
    });

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

    if (companiesInDb.count <= 0)
      throw {
        status: StatusCodes.NOT_FOUND,
        message: "There are not transport routes registered",
      };
    if (companiesInDb.rows.length <= 0)
      throw {
        status: StatusCodes.BAD_REQUEST,
        message: '"page.number" is too large for the number of possible pages',
      };
    const totalPages = Math.ceil(companiesInDb.count / objPage.size);

    const transformedCompanies = companiesInDb.rows.map((company) => {
      const companyData = company.get({ plain: true }); // Convert Sequelize instance to simple object
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

    const responseCustom = {
      meta: {
        page: objPage.number,
        pageSize: objPage.size,
        totalRecords: companiesInDb.count,
        totalPages: totalPages,
      },
      data: transformedCompanies,
    };

    return res.status(StatusCodes.OK).send(responseCustom);
  } catch (error) {
    // console.error("Transport routes could not be recovered: ", error.message);
    return next(error);
  }
};

/**
 * Get all transport companies with your routes
 * @param {object} req.query - Object containing the number and size
 * @return {object} Response contains: statuscode (integer), json (objeto): data transport companies. Or if there's error, json (objeto): status, code, detail
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
          attributes: ["id", "origin", "destination", "duration" ],
          required: false,
        },
      ],
      attributes: {
        exclude: [
          "createdBy",
          "createdAt",
          "updatedAt",
          "deletedAt",
          // "imageUri",
        ],
        include: [
          "id",
          "name",
          "nit",
          "description",
          "phone",
          "siteUri",
          "imageUri",
          // ["imageUri", "image"],
          // [db.Sequelize.col("imageUri"), "image"],
        ],
      },
    });

    if (companiesInDb.count <= 0)
      throw {
        status: StatusCodes.NOT_FOUND,
        message: "There are not transport companies registered",
      };
    if (companiesInDb.rows.length <= 0)
      throw {
        status: StatusCodes.BAD_REQUEST,
        message: '"page.number" is too large for the number of possible pages',
      };
    const totalPages = Math.ceil(companiesInDb.count / objPage.size);

    const transformedCompanies = companiesInDb.rows.map((company) => {
      const companyData = company.get({ plain: true }); // Convert Sequelize instance to simple object
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

    const responseCustom = {
      meta: {
        page: objPage.number,
        pageSize: objPage.size,
        totalRecords: companiesInDb.count,
        totalPages: totalPages,
      },
      data: transformedCompanies,
    };

    return res.status(StatusCodes.OK).send(responseCustom);
  } catch (error) {
    // console.error("Transport companies could not be recovered: ", error.message);
    return next(error);
  }
};

/**
 * Get all route timetables of an route
 * @param {object} req.query - Object containing the number and size
 * @return {object} Response contains: statuscode (integer), json (objeto): data transport companies. Or if there's error, json (objeto): status, code, detail
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
      attributes: {
        exclude: ["createdAt", "updatedAt", "deletedAt", "createdBy"],
        include: [
          "id",
          "origin",
          "destination",
          "companyId",
          "duration",
          // ["imageUri", "image"],
          // [db.Sequelize.col("imageUri"), "image"],
        ],
      },
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
 * Upload an excel file that will create/update transport routes in the database. This use "Plantilla_Registro_Rutas_de_Transporte.xlsx". With: originCode, destinationCode, duration, date, hour, tariff
 * @return {object} Response contains: statuscode (integer), json (objeto): meta n data (array of successful and unsuccessful rows). Or if there's error, json (objeto): status, code, detail
 */
exports.postUploadXlsx = async (req, res, next) => {
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

    const contents = xlsx.parse(xlsxFile.buffer);
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
        if (originCode !== caliCodeDane && destinationCode !== caliCodeDane) {
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
            origin: originInDb.dataValues.cityCode,
            destination: destinationInDb.dataValues.cityCode,
            companyId,
          },
          attributes: ["id", "duration"],
          // TODO: This means that the deleted routes will not be revived.
          paranoid: true,
        });

        try {
          if (routeInDb === null) {
            // Create route in db
            const queryRoute = {
              origin: originInDb.dataValues.cityCode,
              destination: destinationInDb.dataValues.cityCode,
              duration,
              companyId,
            };

            routeInDb = await db.TransportRoute.create(queryRoute, {
              transaction,
            });

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
            const queryRoute = {
              date,
              routeId: idRouteInDb,
            };

            timetableInDb = await db.RouteTimetable.create(queryRoute, {
              transaction,
            });
            msgSuccess += "Fecha creada, ";
          }
          msgSuccess += "Fecha no creada, ";
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
            const queryRoute = {
              hour,
              tariff,
              timetableId: timetableInDb.dataValues.id,
            };

            hourInDb = await db.RouteTimetableHourTariff.create(queryRoute, {
              transaction,
            });

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
