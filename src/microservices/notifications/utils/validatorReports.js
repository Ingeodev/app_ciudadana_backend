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
});

const getListAllClosestSchema = joi.object({
  lat: joi.number().min(-90).max(90),
  lon: joi.number().min(-180).max(180),
  number: joi.number().integer().greater(0).required(),
  size: joi.number().integer().greater(0).required(),
}).and('lat', 'lon');

const getListSchema = joi.object({
  number: joi.number().integer().greater(0).required(),
  size: joi.number().integer().greater(0).required(),
});

const postApproveSchema = joi.object({
  id: joi.number().integer().greater(0).required(),
});

const regexAfter0029 = /^(00:[3-9][0-9]|0[1-9]:[0-5][0-9]|1[0-9]:[0-5][0-9]|2[0-3]:[0-5][0-9]|24:00)$/;

const postExpiresSchema = joi.object({
  id: joi.number().integer().greater(0).required(),
  expires: joi.string().trim().required().pattern(regexAfter0029, 'between-00:29-24:00')
  .message({
    'string.pattern.between-00:29-24:00': 'The time must be between 00:29 and 24:00'
  })
});

const getOneSchema = joi.object({
  id: joi.number().integer().greater(0).required(),
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
  vWebGetListAllClosest: async (inputData) => {
    return await use_validator_on_data(getListSchema, inputData);
  },
  vWebPostApprove: async (inputData) => {
    return await use_validator_on_data(postApproveSchema, inputData);
  },
  vWebPostExpires: async (inputData) => {
    return await use_validator_on_data(postExpiresSchema, inputData);
  },

  vWebGetOne: async (inputData) => {
    return await use_validator_on_data(getOneSchema, inputData);
  },
  // * ------------------ END - Web - Reports -----------------
  // * ------------------ Mobile - Reports -----------------
  vMobilePostRegister: async (inputData) => {
    return await use_validator_on_data(postRegisterSchema, inputData);
  },
  vFileReports: async (inputData) => {
    return await use_validator_on_data(vFileSchema, inputData);
  },
  vMobileGetListAllClosest: async (inputData) => {
    return await use_validator_on_data(getListAllClosestSchema, inputData);
  },
  // * ------------------ END - Mobile - Reports -----------------
};
