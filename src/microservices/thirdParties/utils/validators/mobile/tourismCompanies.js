const { StatusCodes } = require("http-status-codes");
const joi = require("joi");

const getListAllSchema = joi.object({
  number: joi.number().integer().greater(0),
  size: joi.number().integer().greater(0),
  lat: joi.number().min(-90).max(90),
  lon: joi.number().min(-180).max(180),
}).and('lon', 'lat');

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
  vMobileGetCompaniesServices: async (inputData) => {
    return await use_validator_on_data(getListAllSchema, inputData);
  },
};
