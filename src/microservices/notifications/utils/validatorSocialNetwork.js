const { StatusCodes } = require("http-status-codes");
const joi = require("joi");

// * ------------------ Web - Social Networks -----------------
const postRegisterchema = joi.object({
  url: joi.string().required().trim().empty("").invalid(" "),
  icon: joi.string().required().trim().empty("").invalid(" "),
  socialNetworkTypeId: joi.number().required().empty("").greater(0).invalid(0),
});

const postUpdatechema = joi.object({
  id: joi.number().empty("").invalid(0).required(),
  url: joi.string().required().trim().empty("").invalid(" "),
  icon: joi.string().required().trim().empty("").invalid(" "),
  socialNetworkTypeId: joi.number().required().empty("").greater(0).invalid(0),
});

const getListAllSchema = joi.object({
  number: joi.number().integer().greater(0).required(),
  size: joi.number().integer().greater(0).required(),
});

const getGetOneSchema = joi.object({
  id: joi.number().required().empty("").greater(0).invalid(0),
});

const postDeleteSchema = joi.object({
  id: joi.number().required().empty("").greater(0).invalid(0),
  // active: joi.boolean().required(),
});
const postStatusSchema = joi.object({
    id: joi.number().integer().greater(0).required(),
    active: joi.bool().required(),
  });

  
// * ------------------ END - Web - Social Networks -----------------
// * ------------------ Mobile - Social Networks -----------------
const mGetListAllSchema = joi.object({
  number: joi.number().integer().greater(0),
  size: joi.number().integer().greater(0),
});

const mGetDependenciesSchema = joi.object({
  number: joi.number().integer().greater(0),
  size: joi.number().integer().greater(0),
});
// * ------------------ END - Mobile - Social Networks -----------------


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
  // * ------------------ Web - Social Networks -----------------
  vWebPostRegister: async (inputData) => {
    return await use_validator_on_data(postRegisterchema, inputData);
  },
  vWebPostUpdate: async (inputData) => {
    return await use_validator_on_data(postUpdatechema, inputData);
  },
  vWebGetListAll: async (inputData) => {
    return await use_validator_on_data(getListAllSchema, inputData);
  },
  vWebGetOne: async (inputData) => {
    return await use_validator_on_data(getGetOneSchema, inputData);
  },
  vWebPostDelete: async (inputData) => {
    return await use_validator_on_data(postDeleteSchema, inputData);
  },
  vWebPostStatus: async (inputData) => {
    return await use_validator_on_data(postStatusSchema, inputData);
  },
  // * ------------------ END - Web - Social Networks -----------------
  // * ------------------ Mobile - Social Networks -----------------
  vMobileMGetListAll: async (inputData) => {
    return await use_validator_on_data(mGetListAllSchema, inputData);
  },
  vMobileMGetDependencies: async (inputData) => {
    return await use_validator_on_data(mGetDependenciesSchema, inputData);
  },
  // * ------------------ END - Mobile - Social Networks -----------------
};
