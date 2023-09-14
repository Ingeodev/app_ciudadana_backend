const { StatusCodes } = require("http-status-codes");
const joi = require("joi");

const registerSchema = joi.object({
  timetableId: joi.number().integer().empty("").greater(0).invalid(0).required(),
  tariff: joi.number().integer().min(1000).required(),
  hour: joi.string().trim().required()
    .pattern(/^([01][0-9]|2[0-3]):([0-5][0-9])$/)
    .custom((value, helpers) => {
      return value + ":00";
    }, "Add Seconds"),
});

const editSchema = joi.object({
  id: joi.number().integer().empty("").greater(0).invalid(0).required(),
  timetableId: joi.number().integer().empty("").greater(0).invalid(0).required(),
  tariff: joi.number().integer().min(1000),
  hour: joi.string().trim()
    .pattern(/^([01][0-9]|2[0-3]):([0-5][0-9])$/)
    .custom((value, helpers) => {
      return value + ":00";
    }, "Add Seconds"),
});

const getAllSchema = joi.object({
  timetableId: joi.number().integer().empty("").greater(0).invalid(0).required(),
  number: joi.number().integer().greater(0).required(),
  size: joi.number().integer().greater(0).required(),
});

const getOneSchema = joi.object({
  id: joi.number().empty("").greater(0).invalid(0).required(),
});

const postDeleteSchema = joi.object({
  id: joi.number().empty("").greater(0).invalid(0).required(),
  timetableId: joi.number().integer().empty("").greater(0).invalid(0).required(),

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
  vWebGetAll: async (inputData) => {
    return await use_validator_on_data(getAllSchema, inputData);
  },
  vWebGetOneById: async (inputData) => {
    return await use_validator_on_data(getOneSchema, inputData);
  },
  vWebPostDelete: async (inputData) => {
    return await use_validator_on_data(postDeleteSchema, inputData);
  },
};
