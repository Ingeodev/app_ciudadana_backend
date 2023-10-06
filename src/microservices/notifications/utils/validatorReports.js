const { StatusCodes } = require("http-status-codes");
const joi = require("joi");
const polygonCali = require("../../../utils/polygonCali.js");

// * ------------------ Web - Reports -----------------
// const getListAllByUserSchema = joi.object({
//   number: joi.number().integer().greater(0).required(),
//   size: joi.number().integer().greater(0).required(),
// });
// * ------------------ END - Web - Reports -----------------
// * ------------------ Mobile - Reports -----------------
const postRegisterSchema = joi.object({
  description: joi.string().trim().empty("").invalid(" ").regex(/^[a-zA-ZñÑáéíóúÁÉÍÓÚüÜ\s0-9]+$/, 'Alphanumeric characters only').max(200).required(),
  categoryId: joi.number().integer().invalid(0).required(),
  lat: joi.number().min(-90).max(90).required(),
  lon: joi.number().min(-180).max(180).required(),
}).custom((value, helpers) => {
    if (!polygonCali.isLocationInCali(value.lat, value.lon)) {
      return helpers.message("lat and lon must belong to the area of the municipality of Cali, Valle del Cauca, Colombia");
    }
    return value;
});

const vFileSchema = joi.object({
  fieldname: joi.string().required(),
  originalname: joi.string().required(),
  encoding: joi.string().required(),
  mimetype: joi.string().required(),
  size: joi.number().required(),
  buffer: joi.binary().required(),
}).required().error(new Error('A valid file is required.'));

const getGetCoordinatesSchema = joi.object({
  lat: joi.number().min(-90).max(90),
  lon: joi.number().min(-180).max(180),
}).and('lat', 'lon');

const getListAllClosestSchema = joi.object({
  number: joi.number().integer().greater(0).required(),
  size: joi.number().integer().greater(0).required(),
});
// * ------------------ END - Mobile - Reports -----------------

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
  // * ------------------ Web - Reports -----------------
  // vWebGetListAllByUser: async (inputData) => {
  //   return await use_validator_on_data(getListAllByUserSchema, inputData);
  // },
  // * ------------------ END - Web - Reports -----------------
  // * ------------------ Mobile - Reports -----------------
  vMobilePostRegister: async (inputData) => {
    return await use_validator_on_data(postRegisterSchema, inputData);
  },
  vfileReports: async (inputData) => {
    return await use_validator_on_data(vFileSchema, inputData);
  },
  vMobileGetCoordinates: async (inputData) => {
    return await use_validator_on_data(getGetCoordinatesSchema, inputData);
  },
  vMobileGetListAllClosest: async (inputData) => {
    return await use_validator_on_data(getListAllClosestSchema, inputData);
  },
  // * ------------------ END - Mobile - Reports -----------------
};
