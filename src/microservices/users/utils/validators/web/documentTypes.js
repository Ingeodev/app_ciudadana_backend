const { StatusCodes } = require("http-status-codes");
const joi = require("joi");

// const uri_string = joi.string().uri();
// const integer_number = joi.number().integer();

const registerSchema = joi.object({
  name: joi.string().trim().required().empty("").invalid(" "),
  code: joi.string().trim().required().empty("").invalid(" "),
});

const editSchema = joi.object({
  id: joi.number().integer().empty("").invalid(0).required(),
  name: joi.string().trim().empty("").invalid(" "),
  code: joi.string().trim().empty("").invalid(" "),
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
};
