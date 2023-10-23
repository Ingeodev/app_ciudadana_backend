const { StatusCodes } = require("http-status-codes");
const joi = require("joi");

const getRoutesSchema = joi.object({
  // number: joi.number().integer().greater(0),
  // size: joi.number().integer().greater(0),
  city: joi.number().integer().greater(0).invalid(0).required(),
  date: joi.string().required()
    .pattern(/^\d{4}-\d{2}-\d{2}$/)
    .custom((value, helpers) => {
      const currentDate = new Date();
      const inputDate = new Date(value);

      // We check if the date is invalid or in the past.
      if (isNaN(inputDate.getTime()) || inputDate < currentDate) {
        return helpers.error("array.greaterThan");
      }
      return value; // Return date if valid
    })
    .error((errors) => {
      errors.forEach((err) => {
        // const label = err.local?.label || "value";
        switch (err.code) {
          case "string.pattern.base":
            err.message = `"date" format must be aaaa-mm-dd.`;
            break;
          case "any.required":
            err.message = `"date" is required.`;
            break;
          case "array.greaterThan":
            err.message = `"date" must be greater than the current date.`;
            break;
          default:
            err.message = `"date" item has an invalid value.`;
            break;
        }
      });
      return errors;
    }),
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
  vMobileGetTransportRoutes: async (inputData) => {
    return await use_validator_on_data(getRoutesSchema, inputData);
  },
};
