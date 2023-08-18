const { StatusCodes } = require("http-status-codes");
const joi = require("joi");

// * ------------------ Web - Reports -----------------
const getGetOneSchema = joi.object({
  id: joi.number().required().empty("").greater(0).invalid(0),
});

const getListAllByUserSchema = joi.object({
  number: joi.number().integer().greater(0).required(),
  size: joi.number().integer().greater(0).required(),
});
// * ------------------ END - Web - Reports -----------------
// * ------------------ Mobile - Reports -----------------
const postRegisterSchema = joi.object({
  title: joi.string().trim().required().empty("").invalid(" "),
  description: joi.string().trim().max(200).empty("").invalid(" "), // not required??
  securityCategoryId: joi.number().empty("").invalid(0).required(),
  userId: joi.number().empty("").invalid(0).required(),
  imageUri: joi.string().uri().required().trim().empty("").invalid(" "),
  lat: joi.number().min(-90).max(90), // not required??
  lon: joi.number().min(-180).max(180), // not required??
});
// * ------------------ END - Mobile - Reports -----------------

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
  // * ------------------ Web - Reports -----------------
  vWebGetOne: async (inputData) => {
    return await use_validator_on_data(getGetOneSchema, inputData);
  },
  vWebGetListAllByUser: async (inputData) => {
    return await use_validator_on_data(getListAllByUserSchema, inputData);
  },
  // * ------------------ END - Web - Attention Lines -----------------
  // * ------------------ Mobile - Attention Lines -----------------
  vMobilePostRegister: async (inputData) => {
    return await use_validator_on_data(postRegisterSchema, inputData);
  },
  // * ------------------ END - Mobile - Attention Lines -----------------
};
