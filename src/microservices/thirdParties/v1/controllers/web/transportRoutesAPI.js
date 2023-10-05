const { StatusCodes } = require("http-status-codes");
const { Sequelize } = require("sequelize");
const path = require("path");
const xlsx = require("node-xlsx");
const db = require("../../../../../models/index.js");
const validatorRoute = require("../../../utils/validators/web/transportRoutes.js");
const validatorDate = require("../../../utils/validators/web/routeTimetables.js");
const validatorHour = require("../../../utils/validators/web/routeTimetablesHourTariff.js");
const formathhmm = require("../../../utils/formatHH_MM.js");
const caliCodeDane = 76001;

/**
 * Create an transport route
 * @param {Array} req.body - Object containing the origin, destination, duration
 * @return {object} Response contains: statuscode (integer), json (objects array): id, origin, destination, companyId, if 200OK. Or if there's error, json (object): status, code, detail
 */
exports.postRouteRegister = async (req, res, next) => {
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
      await validatorRoute.vWebPostRegister({
        originId: req.body.originId,
        destinationId: req.body.destinationId,
        companyId: res.locals.apiTransportCompanyId,
        duration: req.body.duration,
      });

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
      originInDb.dataValues.cityCode !== caliCodeDane &&
      destinationInDb.dataValues.cityCode !== caliCodeDane
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

    // First, validate that the transport company belongs to the user.
    const company = await db.TransportCompany.findOne({
      where: {
        id: companyId,
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
      createdBy: createdBy.id,
    };

    let result = await db.TransportRoute.create(dataQuery);
    delete result.dataValues.deletedAt;
    delete result.dataValues.createdBy;
    result.dataValues.duration = formathhmm.secondsToHhmm(
      result.dataValues.duration
    );
    return res.status(StatusCodes.CREATED).json({ meta: null, data: result });
  } catch (error) {
    // console.error("The transport route could not be created: ", error.message);
    return next(error);
  }
};

/**
 * Update a transport route
 * @param {object} req - Object containing the id, origin, destination, duration
 * @return {object} Response contains: statuscode (integer), json (route object updated) if 200OK. Or if there's error, json (object): status, code, detail
 */
exports.postRouteEdit = async (req, res, next) => {
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
      await validatorRoute.vWebPostEdit({
        id: req.body.id,
        originId: req.body.originId,
        destinationId: req.body.destinationId,
        companyId: res.locals.apiTransportCompanyId,
        duration: req.body.duration,
      });

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
      originInDb.dataValues.cityCode !== caliCodeDane &&
      destinationInDb.dataValues.cityCode !== caliCodeDane
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
    resultUpdate.dataValues.duration = formathhmm.secondsToHhmm(
      resultUpdate.dataValues.duration
    );

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
 * @param {object} req - Object containing the id
 * @return {object} Response contains: statuscode (integer), json (object): id, companyId. Or if there's error, json (object): status, code, detail
 */
exports.postRouteDelete = async (req, res, next) => {
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

    const { id, companyId } = await validatorRoute.vWebPostDelete({
      id: req.body.id,
      companyId: res.locals.apiTransportCompanyId,
    });

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
 * Get all transport routes of an company
 * @param {object} req.query - Object containing the number, and size
 * @return {object} Response contains: statuscode (integer), json (objeto): data transport companies. Or if there's error, json (objeto): status, code, detail
 */
exports.getRouteAll = async (req, res, next) => {
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

    const objPage = await validatorRoute.vWebGetListRoutes({
      companyId: res.locals.apiTransportCompanyId,
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

    let message = undefined;
    if (companiesInDb.count <= 0)
      message = "There are no registered routes of the transport company";
    if (companiesInDb.rows.length <= 0)
      message = '"page[number]" is too large for the number of possible pages.';

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
 * Get all route timetables of an route
 * @param {object} req.query - Object containing the number and size
 * @return {object} Response contains: statuscode (integer), json (objeto): data transport companies. Or if there's error, json (objeto): status, code, detail
 */
exports.getRouteItinerary = async (req, res, next) => {
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

    const objPage = await validatorRoute.vWebGetItinerary({
      routeId: req.query.routeId ? parseInt(req.query.routeId) : null,
      // number: req.query.page ? parseInt(req.query.page.number) : null,
      // size: req.query.page ? parseInt(req.query.page.size) : null,
    });

    let routeInDb = await db.TransportRoute.findOne({
      // // ! Pendiente: Validar permisos del usuario
      where: {
        id: objPage.routeId,
        companyId: res.locals.apiTransportCompanyId
      },
      include: [
        {
          model: db.RouteTimetable,
          where: { date: { [Sequelize.Op.gte]: new Date() } },
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
          // [Sequelize.col("imageUri"), "image"],
        ],
      },
      order: [
        [db.RouteTimetable, "date", "ASC"],
        [db.RouteTimetable, db.RouteTimetableHourTariff, "hour", "ASC"],
      ],
    });

    if (routeInDb == null)
      throw {
        message: "Route could not be retrieved",
        status: StatusCodes.NOT_FOUND,
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
exports.postRouteUploadXlsx = async (req, res, next) => {
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

    const xlsxFile = await validatorRoute.vMulterMemorySingleItemSchema(req.file);
    const { companyId } = await validatorRoute.vWebPostUploadXlsxRoutes({
      companyId: res.locals.apiTransportCompanyId
    });

    // Verify if the transportation company exists
    const companyInDb = await db.TransportCompany.findOne({
      // // ! Pendiente: Validar permisos del usuario
      where: {
        // createdBy: createdBy.id,
        id: companyId,
      },
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
    const namePages = await validatorRoute.vRExcelPagesSchema(contents);

    // for (let iPage = 0; iPage < namePages.length; iPage++) {
    // Validate column names
    // await validatorRoute.vRExcelHeaderSchema({ header: contents[iPage].data[0] });
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
            await validatorRoute.vRExcelRouteSchema({
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
              createdBy: createdBy.id,
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
              tempRouteInDb = await routeInDb.update(
                { duration },
                {
                  transaction,
                }
              );
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
                success.push(
                  `Fila ${row + 1} con campos [${item}]. ${msgSuccess}.`
                );
                continue;
              }
              await transaction.rollback();
              continue;
            }

            await hourInDb.update(
              { tariff },
              {
                transaction,
              }
            );
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
 * @return {object} Response contains: statuscode (integer), file. Or if there's error, json (objeto): status, code, detail
 */
exports.getRouteDownloadXlsxTemplate = async (req, res, next) => {
  try {
    const downloadPath = path.resolve(
      path.join(".", "static", "Plantilla_Registro_Rutas_de_Transporte.xlsx")
    );
    return res.status(StatusCodes.OK).sendFile(downloadPath);
  } catch (error) {
    console.error(error);
    return next({
      status: StatusCodes.NOT_FOUND,
      message: "The excel template has not been loaded.",
    });
  }
};

// ---------------------------------- Dates ---------------------------------------------

/**
 * Create a route timetable
 * @param {object} req - Object containing the date, routeId
 * @return {object} Response contains: statuscode (integer), json (objeto): echo reply, if 200OK. Or if there's error, json (objeto): status, code, detail
 */
exports.postDateRegister = async (req, res, next) => {
  try {
    const { date, routeId, companyId } = await validatorDate.vWebPostRegister({
      date: req.body.date,
      routeId: req.body.routeId,
      companyId: req.locals.apiTransportCompanyId,
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
 * @param {object} req - Object containing the date, routeId, hours (array)
 * @return {object} Response contains: statuscode (integer), json (objeto): echo reply, if 200OK. Or if there's error, json (objeto): status, code, detail
 */
exports.postDateRegisterWithHour = async (req, res, next) => {
  const transaction = await db.sequelize.transaction();
  try {
    const { date, routeId, companyId, hoursTariffs } =
      await validatorDate.vWebPostRegisterWithHour({
        date: req.body.date,
        routeId: req.body.routeId,
        companyId: res.locals.apiTransportCompanyId,
        hoursTariffs: req.body.hoursTariffs,
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

    let result = await db.RouteTimetable.create(dataQuery, { transaction });
    delete result.dataValues.deletedAt;
    result.dataValues.day = new Date(date).getDay();

    // Record hours and tariffs
    const updatedHoursTariffs = hoursTariffs.map((item) => ({
      ...item,
      timetableId: result.dataValues.id,
    }));
    const resultHours = await db.RouteTimetableHourTariff.bulkCreate(
      updatedHoursTariffs,
      { transaction }
    );

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
 * @param {object} req - Object containing the id, date, routeId
 * @return {object} Response contains: statuscode (integer), json (route timetable object updated) if 200OK. Or if there's error, json (objeto): status, code, detail
 */
exports.postDateEdit = async (req, res, next) => {
  try {
    const { id, date, routeId, companyId } = await validatorDate.vWebPostEdit({
      id: req.body.id,
      date: req.body.date,
      routeId: req.body.routeId,
      companyId: res.locals.apiTransportCompanyId,
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
    };

    const timetableInDb = await db.RouteTimetable.findOne({
      where: {
        id,
        routeId,
      },
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
exports.getDateAll = async (req, res, next) => {
  try {
    const objPage = await validatorDate.vWebGetAll({
      companyId: res.locals.apiTransportCompanyId ? parseInt(res.locals.apiTransportCompanyId) : null,
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
      paranoid: true,
    });

    let message = undefined;
    if (timetablesInDb.count <= 0)
      message = "There are no route timetables registered";
    if (timetablesInDb.rows.length <= 0)
      message = '"page[number]" is too large for the number of possible pages.';

    timetablesInDb.rows = timetablesInDb.rows.map((timetable) => {
      return {
        ...timetable.dataValues,
        day: new Date(timetable.date).getDay(),
        deletedAt: undefined,
      };
    });

    return res.status(StatusCodes.OK).json({
      meta: {
        message,
        page: objPage.number,
        pageSize: objPage.size,
        totalRecords: timetablesInDb.count,
        totalPages: Math.ceil(timetablesInDb.count / objPage.size),
      },
      data: timetablesInDb.rows,
    });
  } catch (error) {
    // console.error("Route timetables could not be recovered: ", error.message);
    return next(error);
  }
};

/**
 * Destroy a Route timetable (soft delete)
 * @return {object} Response contains: statuscode (integer), json (objeto): id, routeId, companyId. Or if there's error, json (objeto): status, code, detail
 */
exports.postDateDelete = async (req, res, next) => {
  try {
    const { id, routeId, companyId } = await validatorDate.vWebPostDelete({
      id: req.body.id,
      routeId: req.body.routeId,
      companyId: res.locals.apiTransportCompanyId,
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
      data: { id, routeId, companyId },
    });
  } catch (error) {
    // console.error("Route timetable could not be deleted: ", error.message);
    return next(error);
  }
};

// ---------------------------------- Hours ---------------------------------------------

/**
 * Create a hour n tariff for a route timetable
 * @param {object} req - Object containing the hour, tariff, timetableId
 * @return {object} Response contains: statuscode (integer), json (objeto): echo reply, if 200OK. Or if there's error, json (objeto): status, code, detail
 */
exports.postHourRegister = async (req, res, next) => {
  try {
    const { hour, tariff, timetableId, companyId, routeId } =
      await validatorHour.vWebPostRegister({
        hour: req.body.hour,
        tariff: req.body.tariff,
        timetableId: req.body.timetableId,
        companyId: res.locals.apiTransportCompanyId,
        routeId: req.body.routeId,
      });

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
    return next(error);
  }
};

/**
 * Update a hour n tariff for a route timetable
 * @param {object} req - Object containing the id, hour, tariff, timetableId
 * @return {object} Response contains: statuscode (integer), json (hour n tariff (object updated) for a route timetable) if 200OK. Or if there's error, json (objeto): status, code, detail
 */
exports.postHourEdit = async (req, res, next) => {
  try {
    // ! Por seguridad se deberia de pedir, companyId y routeId
    const { id, hour, tariff, timetableId, companyId, routeId } =
      await validatorHour.vWebPostEdit({
        id: req.body.id,
        hour: req.body.hour,
        tariff: req.body.tariff,
        timetableId: req.body.timetableId,
        companyId: res.locals.apiTransportCompanyId,
        routeId: req.body.routeId,
      });

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
exports.getHourAll = async (req, res, next) => {
  try {
    const objPage = await validatorHour.vWebGetAll({
      companyId: res.locals.apiTransportCompanyId ? parseInt(res.locals.apiTransportCompanyId) : null,
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
    if (companyInDb.count <= 0)
      message = "There are no  registered hour n tariff for a route timetable";
    if (companyInDb.rows.length <= 0)
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
        totalRecords: companyInDb.count,
        totalPages: Math.ceil(companyInDb.count / objPage.size),
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
 * @return {object} Response contains: statuscode (integer), json (objeto): id, timetableId, companyId, routeId. Or if there's error, json (objeto): status, code, detail
 */
exports.postHourDelete = async (req, res, next) => {
  try {
    const { id, timetableId, companyId, routeId } =
      await validatorHour.vWebPostDelete({
        id: req.body.id,
        timetableId: req.body.timetableId,
        companyId: res.locals.apiTransportCompanyId,
        routeId: req.body.routeId,
      });

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

    const timetablesInDb = await db.RouteTimetableHourTariff.findOne({
      where: {
        id,
        timetableId,
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
    // console.error("Hour n tariff for a route timetabe could not be deleted: ", error.message);
    return next(error);
  }
};
