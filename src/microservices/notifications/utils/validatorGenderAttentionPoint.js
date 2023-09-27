const { StatusCodes } = require("http-status-codes");
const joi = require("joi");
const polygonCali = require("../../../utils/polygonCali.js");


// * ------------------ Web - Attention Lines -----------------
const postRegisterchema = joi.object({
  name: joi.string().trim().empty("").invalid(" ").required(),
  description: joi.string().trim().empty("").invalid(" ").required(),
  imageUri: joi.string().uri({ allowRelative: true }).trim().empty("").invalid(" ").required(),
  phone: joi.string().trim().empty("").invalid(" ").required(),
  color: joi.string().trim().empty("").invalid(" ").max(7).regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Hexadecimal Color Code').required(),
  address: joi.string().trim().empty("").invalid(" ").required(),
  iconMap: joi.string().uri({ allowRelative: true }).trim().empty("").invalid(" ").required(),
  lat: joi.number().min(-90).max(90).required(),
  lon: joi.number().min(-180).max(180).required(),
}).custom((value, helpers) => {
    if (!polygonCali.isLocationInCali(value.lat, value.lon)) {
      return helpers.message("lat and lon must belong to the area of the municipality of Cali, Valle del Cauca, Colombia");
    }
    return value;
});

const postUpdatechema = joi.object({
  id: joi.number().integer().empty("").greater(0).invalid(0).required(),
  name: joi.string().trim().empty("").invalid(" "),
  description: joi.string().trim().empty("").invalid(" "),
  imageUri: joi.string().uri({ allowRelative: true }).trim().empty("").invalid(" "),
  phone: joi.string().trim().empty("").invalid(" "),
  color: joi.string().trim().empty("").invalid(" ").max(7).regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Hexadecimal Color Code'),
  address: joi.string().trim().empty("").invalid(" "),
  iconMap: joi.string().uri({ allowRelative: true }).trim().empty("").invalid(" "),
  lat: joi.number().min(-90).max(90).when('address', {
    is: joi.exist(),
    then: joi.required()
  }),
  lon: joi.number().min(-180).max(180).when('address', {
    is: joi.exist(),
    then: joi.required()
  })
}).and('lat', 'lon').with('lat', 'address').with('lon', 'address').custom((data, helpers) => {
  if (!isNaN(parseFloat(data.lat)) && !isNaN(parseFloat(data.lon))) {
    if (!polygonCali.isLocationInCali(data.lat, data.lon)) {
      return helpers.error("any.invalid", {
        message: "lat and lon must be within the municipality of Cali",
      });
    }
    return data;
  }
  return data;
});

const getListAllSchema = joi.object({
  number: joi.number().integer().greater(0).required(),
  size: joi.number().integer().greater(0).required(),
});

const getGetOneSchema = joi.object({
  id: joi.number().empty("").greater(0).invalid(0).required(),
});

const postDeleteSchema = joi.object({
  id: joi.number().empty("").greater(0).invalid(0).required(),
});
// * ------------------ END - Web - Attention Lines -----------------
// * ------------------ Mobile - Attention Lines -----------------
const mGetListAllSchema = joi.object({
  number: joi.number().integer().greater(0),
  size: joi.number().integer().greater(0),
});

const mGetDependenciesSchema = joi.object({
  number: joi.number().integer().greater(0),
  size: joi.number().integer().greater(0),
});
// * ------------------ END - Mobile - Attention Lines -----------------


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
  // * ------------------ Web - Attention Lines -----------------
  vWebPostRegister: async (inputData) => {
    return await use_validator_on_data(postRegisterchema, inputData);
  },
  vWebPostUpdate: async (inputData) => {
    return await use_validator_on_data(postUpdatechema, inputData);
  },
  vWebGetListAll: async (inputData) => {
    return await use_validator_on_data(getListAllSchema, inputData);
  },
  vWebGetOne: async (inputData) => {
    return await use_validator_on_data(getGetOneSchema, inputData);
  },
  vWebPostDelete: async (inputData) => {
    return await use_validator_on_data(postDeleteSchema, inputData);
  },
  // * ------------------ END - Web - Attention Lines -----------------
  // * ------------------ Mobile - Attention Lines -----------------
  vMobileMGetListAll: async (inputData) => {
    return await use_validator_on_data(mGetListAllSchema, inputData);
  },
  vMobileMGetDependencies: async (inputData) => {
    return await use_validator_on_data(mGetDependenciesSchema, inputData);
  },
  // * ------------------ END - Mobile - Attention Lines -----------------
};
