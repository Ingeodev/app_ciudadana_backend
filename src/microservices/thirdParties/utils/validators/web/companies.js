const { StatusCodes } = require("http-status-codes");
const joi = require("joi");


const registerSchema = joi.object({
  name: joi.string().trim().empty("").invalid(" ").max(50).required(),
  nit: joi.string().trim().empty("").invalid(" ").max(50).regex(/^\d+-\d$/).required().messages({
      'string.pattern.base': 'The NIT must be in the format of numbers + "-" + verification digit',
    }),
  categoryId: joi.number().integer().greater(0).invalid(0).required(),
  description: joi.string().trim().empty("").invalid(" "),
  phone: joi.string().trim().empty("").invalid(" "),
  siteUri: joi.string().uri({ allowRelative: true }).trim().empty("").invalid(" "),
  address: joi.string().trim().empty("").invalid(" ").required(),
  imageUri: joi.string().uri({ allowRelative: true }).trim().empty("").invalid(" "),
  lat: joi.number().min(-90).max(90).required(),
  lon: joi.number().min(-180).max(180).required(),
});

const editSchema = joi.object({
  id: joi.number().integer().greater(0).invalid(0).required(),
  name: joi.string().trim().empty("").invalid(" ").max(50),
  nit: joi.string().trim().empty("").invalid(" ").max(50).regex(/^\d+-\d$/).messages({
      'string.pattern.base': 'The NIT must be in the format of numbers + "-" + verification digit',
    }),
  categoryId: joi.number().integer().greater(0).invalid(0),
  description: joi.string().trim().empty("").invalid(" "),
  phone: joi.string().trim().empty("").invalid(" "),
  siteUri: joi.string().uri({ allowRelative: true }).trim().empty("").invalid(" "),
  address: joi.string().trim().empty("").invalid(" "),
  imageUri: joi.string().uri({ allowRelative: true }).trim().empty("").invalid(" "),
  lat: joi.number().min(-90).max(90),
  lon: joi.number().min(-180).max(180),
});

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
  },
};
