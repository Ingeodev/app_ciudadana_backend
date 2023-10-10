const { StatusCodes } = require("http-status-codes");
const joi = require("joi");


const servicesSchema = joi.object({
  companyId: joi.number().integer().greater(0).invalid(0).required(),
  services: joi.array().min(1).items(
      joi.object({
        service: joi.string().trim().empty("").invalid(" ").regex(/^[a-zA-ZñÑáéíóúÁÉÍÓÚüÜ\s0-9]+$/, 'Alphanumeric characters only').max(50).required(),
      }).unknown(false) // This is to ensure that there are no additional fields in the object.
  ).required(),
});

const editSchema = joi.object({
  id: joi.number().integer().greater(0).invalid(0).required(),
  service: joi.string().trim().empty("").invalid(" ").regex(/^[a-zA-ZñÑáéíóúÁÉÍÓÚüÜ\s0-9]+$/, 'Alphanumeric characters only').max(50).required(),
  companyId: joi.number().integer().greater(0).invalid(0).required(),
});

const postDeleteSchema = joi.object({
  id: joi.number().integer().greater(0).invalid(0).required(),
  companyId: joi.number().integer().greater(0).invalid(0).required(),
});

const getListAllSchema = joi.object({
  number: joi.number().integer().greater(0).required(),
  size: joi.number().integer().greater(0).required(),
  companyId: joi.number().integer().greater(0).invalid(0).required(),
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
  vWebPostServices: async (inputData) => {
    return await use_validator_on_data(servicesSchema, inputData);
  },
  vWebPostEdit: async (inputData) => {
    return await use_validator_on_data(editSchema, inputData);
  },
  vWebPostDelete: async (inputData) => {
    return await use_validator_on_data(postDeleteSchema, inputData);
  },
  vWebGetListAll: async (inputData) => {
    return await use_validator_on_data(getListAllSchema, inputData);
  },
};
