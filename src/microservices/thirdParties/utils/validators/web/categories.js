const { StatusCodes } = require("http-status-codes");
const joi = require("joi");

// const uri_string = joi.string().uri({ allowRelative: true });
// const integer_number = joi.number().integer();

const registerSchema = joi.object({
  name: joi.string().trim().empty("").invalid(" ").regex(/^[a-zA-ZñÑáéíóúÁÉÍÓÚüÜ\s0-9]+$/, 'Alphanumeric characters only').max(50).required(),
  icon: joi.string().uri({ allowRelative: true }).trim().empty("").invalid(" ").required(),
  iconMap: joi.string().uri({ allowRelative: true }).trim().empty("").invalid(" ").required(),
  color: joi.string().trim().empty("").invalid(" ").max(7).regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Hexadecimal Color Code').required(),
});

const editSchema = joi.object({
  id: joi.number().integer().greater(0).invalid(0).required(),
  name: joi.string().trim().empty("").invalid(" ").regex(/^[a-zA-ZñÑáéíóúÁÉÍÓÚüÜ\s0-9]+$/, 'Alphanumeric characters only').max(50),
  icon: joi.string().uri({ allowRelative: true }).trim().empty("").invalid(" "),
  iconMap: joi.string().uri({ allowRelative: true }).trim().empty("").invalid(" "),
  color: joi.string().trim().empty("").invalid(" ").max(7).regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Hexadecimal Color Code'),
});

const getAllSchema = joi.object({
  number: joi.number().integer().greater(0).required(),
  size: joi.number().integer().greater(0).required(),
});

const getOneSchema = joi.object({
  id: joi.number().integer().greater(0).invalid(0).required(),
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
