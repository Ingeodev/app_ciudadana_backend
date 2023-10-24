const { StatusCodes } = require("http-status-codes");
const joi = require("joi");
const polygonCali = require("../../../../../utils/polygonCali.js");

const coordinate = joi.array().length(2).items(
    joi.number().min(-180).max(180).required(), // lon
    joi.number().min(-90).max(90).required()    // lat
).custom((value, helpers) => {
  if (!polygonCali.isLocationInCali(value[1], value[0])) {
    return helpers.message("The coordinate(s) must belong to the area of the municipality of Cali, Valle del Cauca, Colombia");
  }
  return value;
});

const registerSchema = joi.object({
  title: joi.string().trim().empty("").invalid(" ").regex(/^[a-zA-ZñÑáéíóúÁÉÍÓÚüÜ\s0-9]+$/, 'Alphanumeric characters only').max(50).required(),
  description: joi.string().trim().empty("").invalid(" ").regex(/^[a-zA-ZñÑáéíóúÁÉÍÓÚüÜ\s0-9]+$/, 'Alphanumeric characters only').max(200).required(),
  startDate: joi.date().greater('now').required(),
  endDate: joi.date().greater(joi.ref('startDate')).required(),
  iconMap: joi.string().uri({ allowRelative: true }).trim().empty("").invalid(" ").required(),
  color: joi.string().trim().empty("").invalid(" ").max(7).regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Hexadecimal Color Code').required(),
  recurrence: joi.string().trim().empty("").invalid(" ").regex(/^[a-zA-ZñÑáéíóúÁÉÍÓÚüÜ\s0-9]+$/, 'Alphanumeric characters only').max(50).required(),
  typeCoordinates: joi.string().trim().empty("").valid('Point', 'LineString', 'Polygon').required(),
  coordinates: joi.when('typeCoordinates', {
        is: 'Point',
        then: coordinate,
        otherwise: joi.when('typeCoordinates', {
            is: 'LineString',
            then: joi.array().items(coordinate).min(2), // crooked line
            // then: joi.array().items(coordinate).length(2), // line of two points
            otherwise: joi.array().items(
                joi.array().items(coordinate).min(3)
            )
        })
    }).required()
});

const editSchema = joi.object({
  id: joi.number().integer().greater(0).invalid(0).required(),
  title: joi.string().trim().empty("").invalid(" ").regex(/^[a-zA-ZñÑáéíóúÁÉÍÓÚüÜ\s0-9]+$/, 'Alphanumeric characters only').max(50),
  description: joi.string().trim().empty("").invalid(" ").regex(/^[a-zA-ZñÑáéíóúÁÉÍÓÚüÜ\s0-9]+$/, 'Alphanumeric characters only').max(200),
  startDate: joi.date().greater('now'),
  endDate: joi.date().greater(joi.ref('startDate')),
  iconMap: joi.string().uri({ allowRelative: true }).trim().empty("").invalid(" "),
  color: joi.string().trim().empty("").invalid(" ").max(7).regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Hexadecimal Color Code'),
  recurrence: joi.string().trim().empty("").invalid(" ").regex(/^[a-zA-ZñÑáéíóúÁÉÍÓÚüÜ\s0-9]+$/, 'Alphanumeric characters only').max(50),
  typeCoordinates: joi.string().trim().empty("").valid('Point', 'LineString', 'Polygon'),
  coordinates: joi.when('typeCoordinates', {
        is: 'Point',
        then: coordinate,
        otherwise: joi.when('typeCoordinates', {
            is: 'LineString',
            then: joi.array().items(coordinate).length(2),
            otherwise: joi.array().items(
                joi.array().items(coordinate).min(3)
            )
        })
    })
}).and('typeCoordinates', 'coordinates');

const getProfile = joi.object({
  id: joi.number().integer().greater(0).invalid(0).required(),
});

const getListAllSchema = joi.object({
  number: joi.number().integer().greater(0).required(),
  size: joi.number().integer().greater(0).required(),
});

const postDeleteSchema = joi.object({
  id: joi.number().integer().greater(0).invalid(0).required(),
});

const use_validator_on_data = async (validator_schema, data) => {
  try {
    if (!validator_schema) {
      return Promise.reject(new Error("validator_schema cannot be falsy."));
    }
    const validated_data = await validator_schema.validateAsync(data, {
      convert: true,
      abortEarly: true,
      errors: { render: true, label: "key" },
      stripUnknown: true,
    });
    return validated_data;
  } catch (error) {
    error.status = StatusCodes.BAD_REQUEST;
    return Promise.reject(error);
  }
};

module.exports = {
  vWebPostRegister: async (inputData) => {
    return await use_validator_on_data(registerSchema, inputData);
  },
  vWebPostEdit: async (inputData) => {
    return await use_validator_on_data(editSchema, inputData);
  },
  vWebGetProfile: async (inputData) => {
    return await use_validator_on_data(getProfile, inputData);
  },
  vWebGetListAll: async (inputData) => {
    return await use_validator_on_data(getListAllSchema, inputData);
  },
  vWebPostDelete: async (inputData) => {
    return await use_validator_on_data(postDeleteSchema, inputData);
  }
};
