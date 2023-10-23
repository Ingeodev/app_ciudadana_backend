const { StatusCodes } = require("http-status-codes");
const { Op } = require("sequelize");
const db = require("../../../../../models/index.js");
const validator = require("../../../utils/validators/mobile/transportRoutes.js");
const constant = require("../../../constant.json");
const caliCityCode = constant.CALI_CITY_CODE;

/**
 * Get the available routes for a given route
 * @param {object} req.query - Object containing the idCity n date
 * @return {object} Response contains: statusCode (integer), json (objeto): companies data. Or if there's error, json (objeto): status, code, detail
 */
exports.getTransportRoutes = async (req, res, next) => {
  try {
    const { city: idCity, date } = await validator.vMobileGetTransportRoutes({
      city: req.query.city,
      date: req.query.date,
      // number: req.query.page ? parseInt(req.query.page.number) : 1,
      // size: req.query.page ? parseInt(req.query.page.size) : 100,
    });

    const cities = await db.City.findAll({
      where: {
        [Op.or]: [{ id: idCity }, { cityCode: caliCityCode }],
      },
      attributes: ["id", "city", "cityCode"],
    });

    if (cities.length !== 2) {
      throw {
        message: "City not found",
        status: StatusCodes.UNPROCESSABLE_ENTITY,
      };
    }

    const objCity = {
      otherCity: {
        id: cities.find((city) => city.id === idCity).id,
        city: cities.find((city) => city.id === idCity).city,
        cityCode: cities.find((city) => city.id === idCity).cityCode,
      },
      caliCity: {
        id: cities.find((city) => city.cityCode === caliCityCode).id,
        city: cities.find((city) => city.cityCode === caliCityCode).city,
        cityCode: cities.find((city) => city.cityCode === caliCityCode).cityCode,
      },
    };

    const toCaliInDb = await db.TransportCompany.findAll({
      include: [
        {
          model: db.TransportRoute,
          where: {
            origin: objCity.otherCity.id,
            destination: objCity.caliCity.id,
          },
          include: [
            {
              model: db.RouteTimetable,
              where: { date },
              include: [
                {
                  model: db.RouteTimetableHourTariff,
                  // RouteTimetableHourTariff
                  attributes: {
                    exclude: [
                      "id",
                      "timetableId",
                      "hour",
                      "tariff",
                      "createdAt",
                      "updatedAt",
                      "deletedAt",
                    ],
                    include: [
                      ["hour", "time"],
                      ["tariff", "cost"],
                    ],
                  },
                },
              ],
              // RouteTimetable
              paranoid: true,
              attributes: {
                exclude: [
                  "id",
                  "routeId",
                  "createdAt",
                  "updatedAt",
                  "deletedAt",
                ],
                include: ["date"],
              },
            },
          ],
          // TransportRoutes
          paranoid: true,
          attributes: {
            exclude: [
              "id",
              "createdBy",
              "origin",
              "destination",
              "companyId",
              "createdAt",
              "updatedAt",
              "deletedAt",
            ],
            include: ["duration"],
          },
        },
      ],
      // Companies
      paranoid: true,
      attributes: {
        exclude: [
          "createdBy",
          "name",
          "nit",
          "description",
          "phone",
          "siteUri",
          "imageUri",
          "createdAt",
          "updatedAt",
          "deletedAt",
        ],
        include: ["id", ["name", "companyName"], ["imageUri", "image"]],
      },
    });

    let transformedToCali = toCaliInDb.map((company) => {
      return {
        id: company.dataValues.id,
        companyName: company.dataValues.companyName,
        image: company.dataValues.image,
        routesToOrigin: company.dataValues.TransportRoutes.flatMap((route) =>
          route.dataValues.RouteTimetables.flatMap((timetable) =>
            timetable.dataValues.RouteTimetableHourTariffs.map(
              (hourTariff) => ({
                duration: route.dataValues.duration,
                time: hourTariff.dataValues.time,
                cost: hourTariff.dataValues.cost,
              })
            )
          )
        ),
      };
    });

    const fromCaliInDb = await db.TransportCompany.findAll({
      include: [
        {
          model: db.TransportRoute,
          where: {
            origin: objCity.caliCity.id,
            destination: objCity.otherCity.id,
          },
          include: [
            {
              model: db.RouteTimetable,
              where: { date },
              include: [
                {
                  model: db.RouteTimetableHourTariff,
                  // RouteTimetableHourTariff
                  attributes: {
                    exclude: [
                      "id",
                      "timetableId",
                      "hour",
                      "tariff",
                      "createdAt",
                      "updatedAt",
                      "deletedAt",
                    ],
                    include: [
                      ["hour", "time"],
                      ["tariff", "cost"],
                    ],
                  },
                },
              ],
              // RouteTimetable
              paranoid: true,
              attributes: {
                include: ["date"],
              },
            },
          ],
          // TransportRoutes
          paranoid: true,
          attributes: {
            include: ["duration"],
          },
        },
      ],
      // Companies
      paranoid: true,
      attributes: {
        exclude: [
          "createdBy",
          "name",
          "nit",
          "description",
          "phone",
          "siteUri",
          "imageUri",
          "createdAt",
          "updatedAt",
          "deletedAt",
        ],
        include: ["id", ["name", "companyName"], ["imageUri", "image"]],
      },
    });

    if (
      (!fromCaliInDb ||
        fromCaliInDb.length === 0 ||
        !fromCaliInDb[0].TransportRoutes ||
        fromCaliInDb[0].TransportRoutes.length === 0 ||
        !fromCaliInDb[0].TransportRoutes[0].RouteTimetables ||
        fromCaliInDb[0].TransportRoutes[0].RouteTimetables.length === 0 ||
        !fromCaliInDb[0].TransportRoutes[0].RouteTimetables[0]
          .RouteTimetableHourTariffs ||
        fromCaliInDb[0].TransportRoutes[0].RouteTimetables[0]
          .RouteTimetableHourTariffs.length === 0) &&
      (!toCaliInDb ||
        toCaliInDb.length === 0 ||
        !toCaliInDb[0].TransportRoutes ||
        toCaliInDb[0].TransportRoutes.length === 0 ||
        !toCaliInDb[0].TransportRoutes[0].RouteTimetables ||
        toCaliInDb[0].TransportRoutes[0].RouteTimetables.length === 0 ||
        !toCaliInDb[0].TransportRoutes[0].RouteTimetables[0]
          .RouteTimetableHourTariffs ||
        toCaliInDb[0].TransportRoutes[0].RouteTimetables[0]
          .RouteTimetableHourTariffs.length === 0)
    ) {
      throw {
        message: `Transport routes between ${objCity.caliCity.city} and ${objCity.otherCity.city} not found.`,
        status: StatusCodes.NOT_FOUND,
      };
    }

    let transformedFromCali = fromCaliInDb.map((company) => {
      return {
        id: company.dataValues.id,
        companyName: company.dataValues.companyName,
        image: company.dataValues.image,
        routesToDestination: company.dataValues.TransportRoutes.flatMap(
          (route) =>
            route.dataValues.RouteTimetables.flatMap((timetable) =>
              timetable.dataValues.RouteTimetableHourTariffs.map(
                (hourTariff) => ({
                  duration: route.dataValues.duration,
                  time: hourTariff.dataValues.time,
                  cost: hourTariff.dataValues.cost,
                })
              )
            )
        ),
      };
    });

    let combinedMap = {};

    // Process transformedToCali
    for (const company of transformedToCali) {
      combinedMap[company.id] = {
        id: company.id,
        companyName: company.companyName,
        image: company.image,
        routesToOrigin: company.routesToOrigin || [],
        routesToDestination: [],
      };
    }

    // Process transformedFromCali
    for (const company of transformedFromCali) {
      if (combinedMap[company.id]) {
        combinedMap[company.id].routesToDestination =
          company.routesToDestination || [];
      } else {
        combinedMap[company.id] = {
          id: company.id,
          companyName: company.companyName,
          image: company.image,
          routesToOrigin: [],
          routesToDestination: company.routesToDestination || [],
        };
      }
    }

    // Convert combinedMap from object to array
    let combinedArray = Object.values(combinedMap);

    // if routesToOrigin and routesToDestination are equal to [], then have that object removed from the array
    combinedArray = combinedArray.filter((company) => {
      return !(
        company.routesToOrigin.length === 0 &&
        company.routesToDestination.length === 0
      );
    });
    return res.status(StatusCodes.OK).send(combinedArray);
  } catch (error) {
    return next(error);
  }
};
