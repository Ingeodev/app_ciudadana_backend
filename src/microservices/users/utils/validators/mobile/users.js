const { StatusCodes } = require('http-status-codes');
const joi = require('joi');

// * ------------- App Mobile --------------------------------
const postAccountInfoSchema = joi.object({
  name: joi.string().trim().allow('').default(''),
  lastName: joi.string().trim().allow('').default(''),
  phone: joi.string().trim().allow('').default(''),
  email: joi.string().trim().email().empty("").invalid(" ").required(),
});

const postAccountFullLoginSchema = joi.object({
  documentTypeId: joi.number().integer().greater(0).required(),
  document: joi.string().trim().empty("").invalid(" ").required(),
  address: joi.string().trim().empty("").invalid(" ").max(255).required(),
  imageUri: joi.string().uri().optional().allow(null, ''),
});

const postAccountUpdateUserSchema = joi.object({
  name: joi.string().trim().empty("").invalid(" ").regex(/^[a-zA-ZñÑáéíóúÁÉÍÓÚüÜ\s0-9]+$/, 'Alphanumeric characters only').max(50),
  lastName: joi.string().trim().empty("").invalid(" ").regex(/^[a-zA-ZñÑáéíóúÁÉÍÓÚüÜ\s0-9]+$/, 'Alphanumeric characters only').max(50),
  phone: joi.string().trim().empty("").invalid(" ").regex(/^[0-9]*$/, 'Numeric String').length(10),
  address: joi.string().trim().empty("").invalid(" ").max(255),
});

const vFileSchema = joi.object({
    fieldname: joi.string().required(),
    originalname: joi.string().required(),
    encoding: joi.string().required(),
    mimetype: joi.string().required(),
    size: joi.number().required(),
    buffer: joi.binary().required(),
}).required().error(new Error('A valid file is required.'));

const use_validator_on_data = async (validator_schema, data) => {
    try {
        if (!validator_schema) {
            return Promise.reject(new Error("validator_schema cannot be falsy."));
        }
        const validated_data = await validator_schema.validateAsync(data, {
            convert: true,
            abortEarly: true,
            errors: { render: true, label: 'key' },
            stripUnknown: true
        });
        return validated_data;
    } catch (error) {
        error.status = StatusCodes.BAD_REQUEST;
        return Promise.reject(error);
    }
};

module.exports = {
  // * ------------- App Mobile --------------------------------
  vPostAccountInfo: async (inputData) => {
    return await use_validator_on_data(postAccountInfoSchema, inputData);
  },
  vPostAccountFullLogin: async (inputData) => {
    return await use_validator_on_data(postAccountFullLoginSchema, inputData);
  },
  vPostAccountUpdateUser: async (inputData) => {
    return await use_validator_on_data(postAccountUpdateUserSchema, inputData);
  },
  vfileFullLogin: async (inputData) => {
    return await use_validator_on_data(vFileSchema, inputData);
  }
};
