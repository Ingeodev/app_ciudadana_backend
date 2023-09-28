const { StatusCodes } = require("http-status-codes");
const { isLocationInCali } = require("./polygonCali");
const Joi = require("joi");

/**
 * Joi Custom validator that checks whether the geo point is within the limits of Cali, Valle, Colombia.
 * @param {*} data Validation object possibly containing the lat and lon keys. If both keys are not present then this function just skips.
 * @param {Joi.CustomHelpers} helpers 
 * @returns `data` on successful validation; Joi error with validation message on validation error.
 */
const isInCaliCustomJoiValidator = (data, helpers) => {
  if (data.lon != null && data.lat != null)
    if (!isLocationInCali(data.lat, data.lon))
      return helpers.message('The combination of "lat" and "lon" must belong to the area of the municipality of Cali, Valle del Cauca, Colombia');
  return data;
};

/**
 * Asyncronously uses the `validator_schema` to validate the incoming `data` with Joi.
 * @param {Joi.ObjectSchema} validator_schema Validation schema to use.
 * @param {object} data Incoming data to validate.
 * @returns {object} Validated data.
 * @throws Validation error and BAD_REQUEST (400) status on validation failure.
 */
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
  use_validator_on_data,
  isInCaliCustomJoiValidator,
}