const { StatusCodes } = require("http-status-codes");
const joi = require("joi");


const registerSchema = joi.object({
  name: joi.string().trim().empty("").invalid(" ").regex(/^[a-zA-ZñÑáéíóúÁÉÍÓÚüÜ\s0-9]+$/, 'Alphanumeric characters only').max(50).required(),
  nit: joi.string().trim().empty("").invalid(" ").max(50).regex(/^\d+-\d$/).required().messages({
      'string.pattern.base': 'The NIT must be in the format of numbers + "-" + verification digit',
    }),
  description: joi.string().trim().empty("").invalid(" ").regex(/^[a-zA-ZñÑáéíóúÁÉÍÓÚüÜ\s0-9]+$/, 'Alphanumeric characters only').max(200).required(),
  phone: joi.string().trim().empty("").invalid(" ").regex(/^[0-9]*$/, 'Numeric String').required(),
  siteUri: joi.string().uri({ allowRelative: true }).trim().empty("").invalid(" ").required(),
  imageUri: joi.string().uri({ allowRelative: true }).trim().empty("").invalid(" ").required()
});

const editSchema = joi.object({
  id: joi.number().integer().greater(0).invalid(0).required(),
  name: joi.string().trim().empty("").invalid(" ").regex(/^[a-zA-ZñÑáéíóúÁÉÍÓÚüÜ\s0-9]+$/, 'Alphanumeric characters only').max(50),
  nit: joi.string().trim().empty("").invalid(" ").max(50).regex(/^\d+-\d$/).messages({
      'string.pattern.base': 'The NIT must be in the format of numbers + "-" + verification digit',
    }),
  description: joi.string().trim().empty("").invalid(" ").regex(/^[a-zA-ZñÑáéíóúÁÉÍÓÚüÜ\s0-9]+$/, 'Alphanumeric characters only').max(200),
  phone: joi.string().trim().empty("").invalid(" ").regex(/^[0-9]*$/, 'Numeric String'),
  siteUri: joi.string().uri({ allowRelative: true }).trim().empty("").invalid(" "),
  imageUri: joi.string().uri({ allowRelative: true }).trim().empty("").invalid(" ")
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

const apiKeySchema = joi.object({
  expirationAt: joi
    .string()
    .required()
    .pattern(/^\d{4}-\d{2}-\d{2}$/)
    .error((errors) => {
      errors.forEach((err) => {
        // const label = err.local?.label || "value";
        switch (err.code) {
          case "string.pattern.base":
            err.message = `"expirationAt" format must be aaaa-mm-dd.`;
            break;
          case "any.required":
            err.message = `"expirationAt" is required.`;
            break;
          default:
            err.message = `"expirationAt" item has an invalid value.`;
            break;
        }
      });
      return errors;
    }),
  companyId: joi.number().integer().greater(0).invalid(0).required(),
});

const getApiKeySchema = joi.object({
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
  vWebPostApiKey: async (inputData) => {
    return await use_validator_on_data(apiKeySchema, inputData);
  },
  vWebGetApiKey: async (inputData) => {
    return await use_validator_on_data(getApiKeySchema, inputData);
  },
};
