const { StatusCodes } = require("http-status-codes");
const joi = require("joi");

// * ------------------ Web - Reports -----------------
// const getListAllByUserSchema = joi.object({
//   number: joi.number().integer().greater(0).required(),
//   size: joi.number().integer().greater(0).required(),
// });
// * ------------------ END - Web - Reports -----------------
// * ------------------ Mobile - Reports -----------------
const postRegisterSchema = joi.object({
  title: joi.string().trim().required().empty("").invalid(" "),
  description: joi.string().trim().max(200).empty("").invalid(" "),
  securityCategoryId: joi.number().empty("").invalid(0).required(),
  imageUri: joi.string().uri({ allowRelative: true }).required().trim().empty("").invalid(" "),
  lat: joi.number().min(-90).max(90),
  lon: joi.number().min(-180).max(180),
});

const getGetCoordinatesSchema = joi.object({
  lat: joi.number().min(-90).max(90),
  lon: joi.number().min(-180).max(180),
}).and('lat', 'lon');

const getListAllClosestSchema = joi.object({
  number: joi.number().integer().greater(0).required(),
  size: joi.number().integer().greater(0).required(),
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
  // vWebGetListAllByUser: async (inputData) => {
  //   return await use_validator_on_data(getListAllByUserSchema, inputData);
  // },
  // * ------------------ END - Web - Reports -----------------
  // * ------------------ Mobile - Reports -----------------
  vMobilePostRegister: async (inputData) => {
    return await use_validator_on_data(postRegisterSchema, inputData);
  },
  vMobileGetCoordinates: async (inputData) => {
    return await use_validator_on_data(getGetCoordinatesSchema, inputData);
  },
  vMobileGetListAllClosest: async (inputData) => {
    return await use_validator_on_data(getListAllClosestSchema, inputData);
  },
  // * ------------------ END - Mobile - Reports -----------------
};
