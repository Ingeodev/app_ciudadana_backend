const { StatusCodes } = require("http-status-codes");
const joi = require("joi");

const uri_string = joi.string().uri();
const integer_number = joi.number().integer();
const positive_integer = integer_number.positive();
const non_negative_integer = integer_number.min(0);

const page_object = joi.object({
  size: positive_integer.required(),
  number: positive_integer.required(),
});

const advertisementSchema = joi.object({
  imageUri: uri_string.required(),
  siteUri: uri_string.required(),
  categoryId: integer_number,
});

const alertSchema = joi.object({
  message: joi.string().required(),
  push: joi.bool().required(),
  sms: joi.bool().required(),
  alertList: joi.bool().required(),
});

const simplePaginationSchema = joi.object({
  page: page_object,
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
  validateAdvertisementSchema: async (inputData) => {
    return await use_validator_on_data(advertisementSchema, inputData);
  },
  validateAlertSchema: async (inputData) => {
    return await use_validator_on_data(alertSchema, inputData);
  },
  validateSimplePaginationSchema: async (inputData) => {
    return await use_validator_on_data(simplePaginationSchema, inputData);
  },
};
