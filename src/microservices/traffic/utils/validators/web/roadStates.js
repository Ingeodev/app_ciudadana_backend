const { StatusCodes } = require("http-status-codes");
const joi = require("joi");
const polygonCali = require("../../../../../utils/polygonCali.js");

const registerSchema = joi.object({
  title: joi.string().trim().empty("").invalid(" ").regex(/^[a-zA-ZñÑáéíóúÁÉÍÓÚüÜ\s0-9]+$/, 'Alphanumeric characters only').max(50).required(),
  description: joi.string().trim().empty("").invalid(" ").regex(/^[a-zA-ZñÑáéíóúÁÉÍÓÚüÜ\s0-9]+$/, 'Alphanumeric characters only').max(200).required(),
  startDate: joi.date().greater('now').required(),
  endDate: joi.date().greater(joi.ref('startDate')).required(),
  iconMap: joi.string().uri({ allowRelative: true }).trim().empty("").invalid(" ").required(),
  color: joi.string().trim().empty("").invalid(" ").max(7).regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Hexadecimal Color Code').required(),
  recurrence: joi.string().trim().empty("").valid('day', 'week').required(),
  typeCoordinates: joi.string().trim().empty("").valid('Point', 'LineString', 'Polygon').required(),
  // coordinates: joi.array().min(1).items(
  //     joi.array().items(
  //         joi.number().min(-180).max(180).required(), // Lon
  //         joi.number().min(-90).max(90).required()  // Lat
  //       ).length(2)
  // ).required(),
  coordinates: joi.array().min(1).required(),
});

const editSchema = joi.object({
  id: joi.number().integer().greater(0).invalid(0).required(),
  title: joi.string().trim().empty("").invalid(" ").regex(/^[a-zA-ZñÑáéíóúÁÉÍÓÚüÜ\s0-9]+$/, 'Alphanumeric characters only').max(50),
  description: joi.string().trim().empty("").invalid(" ").regex(/^[a-zA-ZñÑáéíóúÁÉÍÓÚüÜ\s0-9]+$/, 'Alphanumeric characters only').max(200),
  startDate: joi.date().greater('now'),
  endDate: joi.date().greater(joi.ref('startDate')),
  iconMap: joi.string().uri({ allowRelative: true }).trim().empty("").invalid(" "),
  color: joi.string().trim().empty("").invalid(" ").max(7).regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Hexadecimal Color Code'),
  recurrence: joi.string().trim().empty("").valid('day', 'week'),
  typeCoordinates: joi.string().trim().empty("").valid('Point', 'LineString', 'Polygon'),
  // coordinates: joi.array().min(1).items(
  //     joi.array().items(
  //         joi.number().min(-180).max(180).required(), // Lon
  //         joi.number().min(-90).max(90).required()  // Lat
  //       ).length(2)
  // ).required(),
  coordinates: joi.array().min(1),
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
