const { StatusCodes } = require('http-status-codes');
const joi = require('joi');

// const uri_string = joi.string().uri();
// const integer_number = joi.number().integer();

// * ------------- App Mobile --------------------------------
const postAccountInfoSchema = joi.object({
  name: joi.string().required().allow(null),
  lastName: joi.string().required().allow(null),
  phone: joi.string().required().allow(null),
  // ! HU-B1 Monday - Solo el email es requerido?. Requerido en la db o para la solicitud HTTP?
  email: joi.string().email().required().allow(null),
});

const postAccountFullLoginSchema = joi.object({
  documentType: joi.string().required(),
  numberDocument: joi.string().required(),
  residenceAddress: joi.string().required(),
  serviceReceiptUri: joi.string().required(),
  serviceReceiptSiteUri: joi.string().required(),
});

const postAccountUpdateUserSchema = joi.object({
  documentType: joi.string().required(),
  numberDocument: joi.string().required(),
  residenceAddress: joi.string().required(),
  serviceReceiptUri: joi.string().required(),
  serviceReceiptSiteUri: joi.string().required(),
});

  // * ------------- App Web --------------------------------
const getUsersListAllActiveSchema = joi.object({
  page: joi.number(),
  pageSize: joi.number(),
});

const postUsersUpdateDisabledSchema = joi.object({
  clientId: joi.string().required().empty(""),
  disabled: joi.boolean().required(),
});

const postUsersUpdateLoginPhaseFullLoginSchema = joi.object({
  clientId: joi.string().required().empty(""),
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
  validatePostAccountInfo: async (inputData) => {
    return await use_validator_on_data(postAccountInfoSchema, inputData);
  },
  validatePostAccountFullLogin: async (inputData) => {
    return await use_validator_on_data(postAccountFullLoginSchema, inputData);
  },

  validatePostAccountUpdateUser: async (inputData) => {
    return await use_validator_on_data(postAccountUpdateUserSchema, inputData);
  },

  // * ------------- App Web --------------------------------
  validateGetUsersListAllActive: async (inputData) => {
    return await use_validator_on_data(getUsersListAllActiveSchema, inputData);
  },
  validatePostUsersUpdateDisabled: async (inputData) => {
    return await use_validator_on_data(postUsersUpdateDisabledSchema, inputData);
  },
  validatepostUsersUpdateLoginPhaseFullLogin: async (inputData) => {
    return await use_validator_on_data(postUsersUpdateLoginPhaseFullLoginSchema, inputData);
  },
};
