const { StatusCodes } = require("http-status-codes");
const axios = require("axios");
const db = require("../../../../../models/index.js");
const validator = require("../../../utils/validators/mobile/taxis");
const { URL_API_TAXIS } = require("../../../constant.json");
const urlAPI = URL_API_TAXIS;

/**
 * Get the required vehicle data from the taxi API in the mobile format.
 * @param {integer} req.params.id - id of the road state
 * @return {object} Response contains: statusCode (integer), json (object): road state data. Or if there's error, json (object): status, code, detail
 */
const getQuery = async (req, res, next) => {
  try {
    const { q: taxiQuery } = await validator.validateTaxiQuerySchema(req.query);
    const colombian_car_plate_regex = validator.getColombianCarPlateRegex();

    let type = null;
    if (colombian_car_plate_regex.test(taxiQuery)) {
      type = "placa";
    }

    const resAPI = await axios.get(`${urlAPI}?${type}=${taxiQuery}`);
    let keys = null;
    let resCustom = {};

    if (resAPI.status === 200) {
      keys = Object.keys(resAPI.data);
      resCustom.type = keys[0];
      resCustom.vehicleModel = "";
      resCustom.vehiclePlate = resAPI.data[keys[0]].placa;
      resCustom.vehicleInsurance = resAPI.data[keys[0]].fecha_venci_soat;
      resCustom.vehicleRtm = resAPI.data[keys[0]].fecha_venci_rtm;
      resCustom.vehicleOperationLicense =
        resAPI.data[keys[0]].tarjeta_operacion;
      resCustom.vehicleOperationDate = resAPI.data[keys[0]].fvence_tarjeta_op;
      resCustom.vehicleDrivers = [];

      resAPI.data[keys[0]].tarjetas_control.forEach((element) => {
        let driverName =
          element.tarjeta.conductor.nombre_1 !== null
            ? element.tarjeta.conductor.nombre_1
            : "";
        driverName +=
          element.tarjeta.conductor.nombre_2 !== null
            ? " " + element.tarjeta.conductor.nombre_2
            : "";
        driverName +=
          element.tarjeta.conductor.apellido_1 !== null
            ? " " + element.tarjeta.conductor.apellido_1
            : "";
        driverName +=
          element.tarjeta.conductor.apellido_2 !== null
            ? " " + element.tarjeta.conductor.apellido_2
            : "";
        const driver = {
          driverName,
          driverImage: element.tarjeta.conductor.foto,
          driverDocument: "",
          driverLicenseDate: element.tarjeta.vence,
          driverControlCard: element.tarjeta.numero,
          driverBadges: [],
        };
        resCustom.vehicleDrivers.push(driver);
      });
    }

    return res.status(StatusCodes.OK).json(resCustom);
  } catch (error) {
    return next(error);
  }
};

/**
 * Create a complaint against a driver or a vehicle in the taxi API and the database. 
 * @param {integer} req.params.id - id of the road state
 * @return {object} Response contains: statusCode (integer), json (object): road state data. Or if there's error, json (object): status, code, detail
 */
const postComplaint = async (req, res, next) => {
  try {
    const createdBy = await db.User.findOne({
      where: { disabled: false, userMobile: true, clientId: res.locals.uid },
      attributes: ["id"],
    });

    if (createdBy == null || createdBy.id == null)
      throw {
        message: "User not found.",
        status: StatusCodes.NOT_FOUND,
      };

    const { type, complaintType, description, identifier } =
      await validator.vWebPostComplaint(req.body);

    // ! FALTA: Validar si la cédula (identificador) del conductor corresponde a un taxi registrado

    // Validate if the license plate of the car corresponds to a registered cab.
    if (type === "vehicle") {
      // const colombian_car_plate_regex = validator.getColombianCarPlateRegex();
      let typeReq = "placa";
      // if (colombian_car_plate_regex.test(identifier)) {
      //   typeReq = "placa";
      // }

      const resAPI = await axios.get(`${urlAPI}?${typeReq}=${identifier}`);
      if (resAPI.status !== 200) {
        throw {
          status: StatusCodes.NOT_FOUND,
          message: "The identifier does not correspond to any taxi",
        };
      }
    }

    await db.TaxiComplaint.create({
      createdBy: createdBy.id,
      type,
      complaintType,
      description,
      identifier,
    });

    return res
      .status(StatusCodes.CREATED)
      .json({ type, complaintType, description, identifier });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  getQuery,
  postComplaint,
};