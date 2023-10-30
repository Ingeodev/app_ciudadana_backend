const { StatusCodes } = require("http-status-codes");
const joi = require("joi");

// const uri_string = joi.string().uri({ allowRelative: true });
// const integer_number = joi.number().integer();

const registerSchema = joi.object({
  name: joi.string().trim().empty("").invalid(" ").regex(/^[a-zA-ZñÑáéíóúÁÉÍÓÚüÜ\s0-9]+$/, 'Alphanumeric characters only').max(50).required(),
  lastName: joi.string().trim().empty("").invalid(" ").regex(/^[a-zA-ZñÑáéíóúÁÉÍÓÚüÜ\s0-9]+$/, 'Alphanumeric characters only').max(50).required(),
  email: joi.string().trim().email().empty("").invalid(" ").required(),
  documentTypeId: joi.number().integer().greater(0).required(),
  document: joi.string().trim().alphanum().empty("").invalid(" ").required(),
});

const emailVerification = joi.object({
  token: joi.string().trim().empty("").invalid(" ").required(),
  ref: joi.string().trim().empty("").invalid(" ").required(),
});

const addRoleSchema = joi.object({
  id: joi.number().integer().greater(0).invalid(0).required(),
  roleId: joi.number().integer().greater(0).required(),
});

const resetPassSchema = joi.object({
  id: joi.number().integer().greater(0).invalid(0).required(),
});

const editSchema = joi.object({
  id: joi.number().integer().greater(0).invalid(0).required(),
  name: joi.string().trim().empty("").invalid(" ").regex(/^[a-zA-ZñÑáéíóúÁÉÍÓÚüÜ\s0-9]+$/, 'Alphanumeric characters only').max(50),
  lastName: joi.string().trim().empty("").invalid(" ").regex(/^[a-zA-ZñÑáéíóúÁÉÍÓÚüÜ\s0-9]+$/, 'Alphanumeric characters only').max(50),
  documentTypeId: joi.number().integer().greater(0),
  document: joi.string().trim().alphanum().empty("").invalid(" "),
});

const editMobileUserSchema = joi.object({
  id: joi.number().integer().greater(0).invalid(0).required(),
  name: joi.string().trim().empty("").invalid(" ").regex(/^[a-zA-ZñÑáéíóúÁÉÍÓÚüÜ\s0-9]+$/, 'Alphanumeric characters only').max(50),
  lastName: joi.string().trim().empty("").invalid(" ").regex(/^[a-zA-ZñÑáéíóúÁÉÍÓÚüÜ\s0-9]+$/, 'Alphanumeric characters only').max(50),
  documentTypeId: joi.number().integer().greater(0),
  document: joi.string().trim().alphanum().empty("").invalid(" "),
  address: joi.string().trim().empty("").invalid(" "),
  phone: joi.string().trim().empty("").invalid(" ").regex(/^[0-9]*$/, 'Numeric String'),
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

const passwdSchema = joi.object({
  clientId: joi.string().trim().empty("").invalid(" ").required(),
  passwd: joi.string().trim().empty("").invalid(" ").regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#%^&()_+{}|:;,.?/])[A-Za-z\d!@#%^&()_+{}|:;,.?/].{8,}$/, 'Password does not meet the conditions').required(),
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
  vWebPostEmailVerification: async (inputData) => {
    return await use_validator_on_data(emailVerification, inputData);
  },
  vWebPostAddRole: async (inputData) => {
    return await use_validator_on_data(addRoleSchema, inputData);
  },
  vWebPostResetPasswd: async (inputData) => {
    return await use_validator_on_data(resetPassSchema, inputData);
  },
  vWebPostEdit: async (inputData) => {
    return await use_validator_on_data(editSchema, inputData);
  },
  vWebPostEditMobileUser: async (inputData) => {
    return await use_validator_on_data(editMobileUserSchema, inputData);
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
  vWebPostPasswd: async (inputData) => {
    return await use_validator_on_data(passwdSchema, inputData);
  },
};
