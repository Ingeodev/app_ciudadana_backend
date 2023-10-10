const { StatusCodes } = require("http-status-codes");
const db = require("../../../../../models");
const validator = require("../../../utils/validators/mobile/taxis");

//#region Mock data sample
// TODO: Delete region
const plate_query_mock_response = {
  "vehiculo": {
    "id": 3,
    "placa": "ABC456",
    "empresa_transporte": {
      "id": 1,
      "razon_social": "Empresa de Transportes Taxis Mil",
      "nit": "9800212121"
    },
    "tarjeta_operacion": "2222222222",
    "fvence_tarjeta_op": "2021-12-31",
    "fecha_venci_rtm": "2021-07-01",
    "fecha_venci_soat": "2021-07-02",
    "tarjetas_control": [
      {
        "tarjeta": {
          "id": 1,
          "numero": "1111111",
          "vence": "2021-07-15",
          "conductor": {
            "id": 4,
            "nombre_1": "ALEX",
            "nombre_2": null,
            "apellido_1": "SOLIS",
            "apellido_2": null,
            "foto": "",
            "rh": "A+",
            "eps": null,
            "arl": null
          }
        }
      }
    ]
  }
}
//#endregion Mock data sample

/** Returns the required driver or vehicle data from the taxi API in the mobile format. */
const getQuery = async (req, res, next) => {
  try {
    const { q: taxiQuery } = await validator.validateTaxiQuerySchema(req.query);
    const colombian_car_plate_regex = validator.getColombianCarPlateRegex();
    let type = 'vehicle';
    if (colombian_car_plate_regex.test(taxiQuery)) {
      type = 'vehicle';
    } else {
      type = 'driver';
    }
    // TODO: consume the API and return real data.
    const data = { msg: "TODO: consume the API and return real data.", type, taxiQuery };
    console.warn("TODO: consume the API and return real data.");
    return res.status(StatusCodes.OK).json(data);
  } catch (error) {
    return next(error);
  }
};

/** Saves a complaint against a driver or a vehicle in the taxi API and the database. */
const postComplaint = async (req, res, next) => {
  try {
    // TODO: Implement
    const data = { msg: "TODO: implement."};
    console.warn("TODO: consume the API and return real data.");
    return res.status(StatusCodes.CREATED).json(data);
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  getQuery,

};