const { StatusCodes } = require('http-status-codes');
const joi = require('joi');

// const uri_string = joi.string().uri();
// const integer_number = joi.number().integer();

// * ------------- App Mobile --------------------------------
const postAccountInfoSchema = joi.object({
  name: joi.string().trim().required().allow(null),
  lastName: joi.string().trim().required().allow(null),
  phone: joi.string().trim().required().allow(null),
  // ! HU-B1 Monday - Solo el email es requerido?. Requerido en la db o para la solicitud HTTP?
  email: joi.string().trim().email().required().allow(null),
});

const postAccountFullLoginSchema = joi.object({
  documentType: joi.string().trim().required(),
  numberDocument: joi.string().trim().required(),
  residenceAddress: joi.string().trim().required(),
  serviceReceiptUri: joi.string().uri().required().trim().empty("").invalid(" "),
  serviceReceiptSiteUri: joi.string().uri().required().trim().empty("").invalid(" "),
});

const postAccountUpdateUserSchema = joi.object({
  name: joi.string().trim().empty("").invalid(" "),
  lastName: joi.string().trim().empty("").invalid(" "),
  phone: joi.string().trim().empty("").invalid(" "),
  residenceAddress: joi.string().trim().empty("").invalid(" "),
});

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
  }
};
