const { StatusCodes } = require("http-status-codes");
const joi = require("joi");

const colombian_car_plate_regex = /^[A-Z]{3}[0-9]{3}$/;

const colombian_car_plate = joi.string().uppercase().trim().length(6).regex(colombian_car_plate_regex, "Colombian Car Plate");
const numeric_string = joi.string().trim().regex(/^[0-9]*$/, "Numeric String");

const taxiQuerySchema = joi.object({
  q: joi.alternatives().try(colombian_car_plate).required(),
});

const complaintSchema = joi.object({
  type: joi.string().trim().valid("vehicle", "driver").required(),
  complaintType: joi.alternatives().conditional("type", {
    is: "vehicle",
    then: joi.string().valid("unauthorized_driver", "vehicle_poor_condition"),
    otherwise: joi.string().valid("overcharge", "inappropriate_behavior", "excessive_speed")
  }).required(),
  description: joi.string().trim().empty("").invalid(" ").required(),
  identifier: joi.alternatives().conditional("type", {
    is: "vehicle",
    then: colombian_car_plate,
    otherwise: joi.number().integer().positive().greater(0),
  }).required()
});

/**
 * Asyncronously uses the `validator_schema` to validate the incoming `data` with joi.
 * @param {joi.ObjectSchema} validator_schema Validation schema to use.
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
  getColombianCarPlateRegex: () => colombian_car_plate_regex,
  validateTaxiQuerySchema: async (inputData) => {
    return await use_validator_on_data(taxiQuerySchema, inputData);
  },
  vWebPostComplaint: async (inputData) => {
    return await use_validator_on_data(complaintSchema, inputData);
  },
};
