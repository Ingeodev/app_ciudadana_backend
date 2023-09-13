const { StatusCodes } = require('http-status-codes');
const joi = require('joi');

// const uri_string = joi.string().uri({ allowRelative: true });
// const integer_number = joi.number().integer();

const postAccountInfoSchema = joi.object({
  name: joi.string().trim().empty("").invalid(" ").required(),
  lastName: joi.string().trim().empty("").invalid(" ").required(),
  phone: joi.string().trim().empty("").invalid(" ").required(),
  // ! HU-B1 Monday - Solo el email es requerido?. Requerido en la db o para la solicitud HTTP?
  email: joi.string().trim().email().empty("").invalid(" ").required(),
});

const postAccountFullLoginSchema = joi.object({
  // documentTypeId: joi.number().integer().greater(0).required(),
  documentTypeId: joi.string().trim().empty("").invalid(" ").required(),
  document: joi.string().trim().empty("").invalid(" ").required(),
  address: joi.string().trim().empty("").invalid(" ").required(),
  serviceReceiptUri: joi.string().uri({ allowRelative: true }).trim().empty("").invalid(" ").required(),
});

const postAccountUpdateUserSchema = joi.object({
  name: joi.string().trim().empty("").invalid(" "),
  lastName: joi.string().trim().empty("").invalid(" "),
  phone: joi.string().trim().empty("").invalid(" "),
  address: joi.string().trim().empty("").invalid(" "),
});

// * ------------- App Web --------------------------------
// const getUsersListAllSchema = joi.object({
//   page: joi.number().integer().greater(0),
//   pageSize: joi.number().integer().greater(0),
// });

const getUsersListAllSchema = joi.object({
  number: joi.number().integer().greater(0).required(),
  size: joi.number().integer().greater(0).required(),
});

const postUsersDeletedSchema = joi.object({
  clientId: joi.string().trim().empty("").required(),
});

const postUsersStatusSchema = joi.object({
  clientId: joi.string().trim().empty("").required(),
  disabled: joi.boolean().required(),
});

const postUsersUpdateLoginPhaseFullLoginSchema = joi.object({
  clientId: joi.string().trim().empty("").required(),
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
  vPostAccountInfo: async (inputData) => {
    return await use_validator_on_data(postAccountInfoSchema, inputData);
  },
  vPostAccountFullLogin: async (inputData) => {
    return await use_validator_on_data(postAccountFullLoginSchema, inputData);
  },

  vPostAccountUpdateUser: async (inputData) => {
    return await use_validator_on_data(postAccountUpdateUserSchema, inputData);
  },
  // * ------------- App Web --------------------------------
  vGetUsersListAll: async (inputData) => {
    return await use_validator_on_data(getUsersListAllSchema, inputData);
  },
  vPostUsersDeleted: async (inputData) => {
    return await use_validator_on_data(postUsersDeletedSchema, inputData);
  },
  vPostUsersStatus: async (inputData) => {
    return await use_validator_on_data(postUsersStatusSchema, inputData);
  },
  vPostUsersUpdateLoginPhaseFullLogin: async (inputData) => {
    return await use_validator_on_data(postUsersUpdateLoginPhaseFullLoginSchema, inputData);
  },
};
