const { StatusCodes } = require("http-status-codes");
const joi = require("joi");

// * ------------------ Web - Reports -----------------
// const postRegisterchema = joi.object({
//   phone: joi.number().integer().greater(0).less(9999999999).required(),
//   whatsapp: joi.number().integer().greater(0).less(9999999999).required(),
// });
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
// const mGetListAllSchema = joi.object({
//   number: joi.number().integer().greater(0),
//   size: joi.number().integer().greater(0),
// });
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
  // vWebPostRegister: async (inputData) => {
  //   return await use_validator_on_data(postRegisterchema, inputData);
  // },
  // * ------------------ END - Web - Attention Lines -----------------
  // * ------------------ Mobile - Attention Lines -----------------
  vMobilePostRegister: async (inputData) => {
    return await use_validator_on_data(postRegisterSchema, inputData);
  },
  // * ------------------ END - Mobile - Attention Lines -----------------
};
