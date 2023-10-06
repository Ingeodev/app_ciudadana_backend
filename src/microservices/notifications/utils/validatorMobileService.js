const { StatusCodes } = require("http-status-codes");
const joi = require("joi");

// * ------------------ Web - Mobile Services -----------------
const postRegisterchema = joi.object({
  route: joi.string().required().trim().empty("").invalid(" ").regex(/^[a-zA-ZñÑáéíóúÁÉÍÓÚüÜ\s0-9]+$/, 'Alphanumeric characters only').max(50),
  name: joi.string().trim().empty("").invalid(" ").regex(/^[a-zA-ZñÑáéíóúÁÉÍÓÚüÜ\s0-9]+$/, 'Alphanumeric characters only').max(50),
  subtitle: joi.string().required().trim().empty("").invalid(" ").regex(/^[a-zA-ZñÑáéíóúÁÉÍÓÚüÜ\s0-9]+$/, 'Alphanumeric characters only').max(50),
  imageUri: joi.string().uri({ allowRelative: true }).trim().empty("").invalid(" ").max(150),
  icon: joi.string().uri({ allowRelative: true }).trim().empty("").invalid(" ").max(150),
  accessLevel: joi.string().required().trim().empty("").invalid(" ").max(50)
});

const postUpdatechema = joi.object({
  id: joi.number().integer().greater(0).invalid(0).required(),
  route: joi.string().required().trim().empty("").invalid(" ").regex(/^[a-zA-ZñÑáéíóúÁÉÍÓÚüÜ\s0-9]+$/, 'Alphanumeric characters only').max(50),
  name: joi.string().trim().empty("").invalid(" ").regex(/^[a-zA-ZñÑáéíóúÁÉÍÓÚüÜ\s0-9]+$/, 'Alphanumeric characters only').max(50),
  subtitle: joi.string().required().trim().empty("").regex(/^[a-zA-ZñÑáéíóúÁÉÍÓÚüÜ\s0-9]+$/, 'Alphanumeric characters only').max(50),
  imageUri: joi.string().uri({ allowRelative: true }).trim().empty("").invalid(" ").max(150),
  icon: joi.string().uri({ allowRelative: true }).trim().empty("").invalid(" ").max(150),
  accessLevel: joi.string().required().trim().empty("").invalid(" ").max(50)
});

const getListAllSchema = joi.object({
  number: joi.number().integer().greater(0).required(),
  size: joi.number().integer().greater(0).required(),
});

const getGetOneSchema = joi.object({
  id: joi.number().integer().greater(0).invalid(0).required(),
});

const postDeleteSchema = joi.object({
  id: joi.number().integer().greater(0).invalid(0).required(),
});
const postStatusSchema = joi.object({
  id: joi.number().integer().greater(0).invalid(0).required(),
  active: joi.bool().required(),
});

// * ------------------ END - Web - Mobile Services -----------------
// * ------------------ Mobile - Mobile Services -----------------
const mGetListAllSchema = joi.object({
  number: joi.number().integer().greater(0),
  size: joi.number().integer().greater(0),
});

const mGetDependenciesSchema = joi.object({
  number: joi.number().integer().greater(0),
  size: joi.number().integer().greater(0),
});
// * ------------------ END - Mobile - Mobile Services -----------------

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
  // * ------------------ Web - Mobile Services -----------------
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
  vWebPostStatus: async (inputData) => {
    return await use_validator_on_data(postStatusSchema, inputData);
  },
  // * ------------------ END - Web - Mobile Services -----------------
  // * ------------------ Mobile - Mobile Services -----------------
  vMobileMGetListAll: async (inputData) => {
    return await use_validator_on_data(mGetListAllSchema, inputData);
  },
  vMobileMGetDependencies: async (inputData) => {
    return await use_validator_on_data(mGetDependenciesSchema, inputData);
  },
  // * ------------------ END - Mobile - Mobile Services -----------------
};
