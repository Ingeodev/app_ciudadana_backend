const { StatusCodes } = require('http-status-codes');
const joi = require('joi');

// const uri_string = joi.string().uri();
// const integer_number = joi.number().integer();

// * ------------- App Web --------------------------------
const getUsersListAllSchema = joi.object({
  page: joi.number().invalid(0),
  pageSize: joi.number().invalid(0),
});

const postUsersUpdateDisabledSchema = joi.object({
  clientId: joi.string().trim().required().empty(""),
  disabled: joi.boolean().required(),
});

const postUsersUpdateLoginPhaseFullLoginSchema = joi.object({
  clientId: joi.string().trim().required().empty(""),
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
  // * ------------- App Web --------------------------------
  vGetUsersListAll: async (inputData) => {
    return await use_validator_on_data(getUsersListAllSchema, inputData);
  },
  vPostUsersUpdateDisabled: async (inputData) => {
    return await use_validator_on_data(postUsersUpdateDisabledSchema, inputData);
  },
  vPostUsersUpdateLoginPhaseFullLogin: async (inputData) => {
    return await use_validator_on_data(postUsersUpdateLoginPhaseFullLoginSchema, inputData);
  },
};
