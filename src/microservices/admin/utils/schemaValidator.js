const { StatusCodes } = require("http-status-codes");
const joi = require("joi");

const registerSchema = joi.object({
  name: joi.string().trim().pattern(/^[a-zA-Z0-9 _:-]*$/).empty("").invalid(" ").max(50).required(),
  description: joi.string().trim().empty("").invalid(" ").max(200).required(),
  permission: joi.string().required().custom((value, helpers) => {
    try {
      JSON.parse(value.replace(/'/g, '"'));
      return value;
    } catch (e) {
      return helpers.message('"permission" must be a valid JSON string');
      // return helpers.error("any.invalid"); // Then you should handle the error with .error()
    }
  })
});

const editSchema = joi.object({
  id: joi.number().integer().empty("").greater(0).invalid(0).required(),
  name: joi.string().pattern(/^[a-zA-Z0-9 _:-]*$/).trim().empty("").invalid(" ").max(50),
  description: joi.string().trim().empty("").invalid(" ").max(200),
  permission: joi.string().custom((value, helpers) => {
    try {
      JSON.parse(value.replace(/'/g, '"'));
      return value;
    } catch (e) {
      return helpers.message('"permission" must be a valid JSON string');
      // return helpers.error("any.invalid"); // Then you should handle the error with .error()
    }
  })
});

const getAllSchema = joi.object({
  number: joi.number().integer().greater(0).required(),
  size: joi.number().integer().greater(0).required(),
});

const getOneSchema = joi.object({
  id: joi.number().empty("").greater(0).invalid(0).required(),
});

const postDeleteSchema = joi.object({
  id: joi.number().empty("").greater(0).invalid(0).required(),
});

const roleToUserSchema = joi.object({
  userId: joi.number().empty("").greater(0).invalid(0).required(),
  roleId: joi.number().empty("").greater(0).invalid(0).required(),
});

const getUsersByIdroleSchema = joi.object({
  roleId: joi.number().valid(null).greater(0).invalid(0),
  number: joi.number().integer().greater(0).required(),
  size: joi.number().integer().greater(0).required(),
});

// -------- JSON
const jsonFileSchema = joi.object({
    fieldname: joi.string().required(),
    originalname: joi.string().required(),
    encoding: joi.string().required(),
    mimetype: joi.string().valid("application/json").required(),
    size: joi.number().required(),
    buffer: joi
      .binary()
      .required()
      .custom((value, helper) => {
        try {
          JSON.parse(value.toString("utf-8"));
          return value;
        } catch (error) {
          return helper.message("Invalid JSON content");
        }
      }),
  }).required().error(new Error("A valid JSON file is required."));

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
  // --------- JSON
  vMulterMemorySingleItemSchema: async (inputData) => {
    return await use_validator_on_data(jsonFileSchema, inputData);
  },
  vWebPostAssignRoleToUser: async (inputData) => {
    return await use_validator_on_data(roleToUserSchema, inputData);
  },
  vWebGetUsersByRoleId: async (inputData) => {
    return await use_validator_on_data(getUsersByIdroleSchema, inputData);
  },
};
