const { StatusCodes } = require("http-status-codes");
const joi = require("joi");

// * ------------------ Web - Attention Lines -----------------
const postRegisterchema = joi.object({
  name: joi.string().required().trim().empty("").invalid(" "),
  phone: joi.string().required().trim().empty("").invalid(" "),
  imageUri: joi.string().uri().required().trim().empty("").invalid(" "),
  imageSiteUri: joi.string().uri().required().trim().empty("").invalid(" "),
  whatsapp: joi.string().required().trim().empty("").invalid(" "),
  url: joi.string().uri().required().trim().empty("").invalid(" "),
});

const postUpdatechema = joi.object({
  id: joi.number().empty("").invalid(0),
  name: joi.string().trim().empty("").invalid(" "),
  phone: joi.string().trim().empty("").invalid(" "),
  imageUri: joi.string().uri().trim().empty("").invalid(" "),
  imageSiteUri: joi.string().uri().trim().empty("").invalid(" "),
  whatsapp: joi.string().trim().empty("").invalid(" "),
  url: joi.string().uri().trim().empty("").invalid(" "),
});

const getListAllSchema = joi.object({
  number: joi.number().integer().greater(0),
  size: joi.number().integer().greater(0),
});

const getGetOneSchema = joi.object({
  id: joi.number().required().empty("").greater(0).invalid(0),
});

const postUpdateActiveSchema = joi.object({
  id: joi.number().required().empty("").greater(0).invalid(0),
  active: joi.boolean().required(),
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
  vWebPostUpdateActive: async (inputData) => {
    return await use_validator_on_data(postUpdateActiveSchema, inputData);
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
