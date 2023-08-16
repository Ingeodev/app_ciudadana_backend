const { StatusCodes } = require("http-status-codes");
const joi = require("joi");

// const uri_string = joi.string().uri();
// const integer_number = joi.number().integer();

const registerSchema = joi.object({
  name: joi.string().trim().required().empty("").invalid(" "),
  imageUri: joi.string().uri().required().trim().empty("").invalid(" "),
  siteUri: joi.string().uri().required().trim().empty("").invalid(" "),
  color: joi.string().trim().empty("").invalid(" ").max(7).pattern(/^#[0-9A-F]{1,6}$/).required(),
});

const editSchema = joi.object({
  id: joi.number().required().integer().empty("").greater(0).invalid(0),
  name: joi.string().trim().empty("").invalid(" "),
  imageUri: joi.string().uri().trim().empty("").invalid(" "),
  siteUri: joi.string().uri().trim().empty("").invalid(" "),
  color: joi.string().trim().empty("").invalid(" ").max(7).pattern(/^#[0-9A-F]{1,6}$/),
});

const getAllSchema = joi.object({
  number: joi.number().integer().greater(0).required(),
  size: joi.number().integer().greater(0).required(),
});

const getOneSchema = joi.object({
  id: joi.number().required().empty("").greater(0).invalid(0),
});

const postActiveSchema = joi.object({
  id: joi.number().required().empty("").greater(0).invalid(0),
  active: joi.boolean().required(),
});

const postDeleteSchema = joi.object({
  id: joi.number().required().empty("").greater(0).invalid(0),
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
  vWebPostStatus: async (inputData) => {
    return await use_validator_on_data(postActiveSchema, inputData);
  },
  vWebPostDelete: async (inputData) => {
    return await use_validator_on_data(postDeleteSchema, inputData);
  },
};
