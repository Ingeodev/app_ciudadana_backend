const { StatusCodes } = require("http-status-codes");
const joi = require("joi");

// * ------------------ Web - Attention Lines -----------------
const postRegisterchema = joi.object({
  phone: joi.number().integer().greater(0).less(9999999999).required(),
  whatsapp: joi.number().integer().greater(0).less(9999999999).required(),
});

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
  // * ------------------ Web - Attention Lines -----------------
  vWebPostRegister: async (inputData) => {
    return await use_validator_on_data(postRegisterchema, inputData);
  },
};
