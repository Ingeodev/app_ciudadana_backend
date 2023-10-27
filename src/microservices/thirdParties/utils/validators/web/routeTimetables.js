const { StatusCodes } = require("http-status-codes");
const joi = require("joi");
const { dateHourWithOffset } = require("../../../../../utils/utcZone");

const registerSchema = joi.object({
  date: joi.string().required()
    .pattern(/^\d{4}-\d{2}-\d{2}$/)
    .custom((value, helpers) => {
      const inputDate = new Date(
        Date.UTC(
          parseInt(value.split("-")[0]),
          parseInt(value.split("-")[1]) - 1, // JavaScript months range from 0 to 11
          parseInt(value.split("-")[2])
        )
      );
      inputDate.setUTCHours(dateHourWithOffset().getUTCHours());
      inputDate.setUTCMinutes(dateHourWithOffset().getUTCMinutes());
      inputDate.setUTCSeconds(dateHourWithOffset().getUTCSeconds());
      inputDate.setUTCMilliseconds(dateHourWithOffset().getUTCMilliseconds());

      // We check if the date is invalid or in the past.
      if (inputDate < dateHourWithOffset()) {
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
  routeId: joi.number().integer().greater(0).invalid(0).required(),
  companyId: joi.number().integer().greater(0).invalid(0).required(),
});

const registerWithHourSchema = joi.object({
  date: joi.string().required()
    .pattern(/^\d{4}-\d{2}-\d{2}$/)
    .custom((value, helpers) => {
      const inputDate = new Date(
        Date.UTC(
          parseInt(value.split("-")[0]),
          parseInt(value.split("-")[1]) - 1, // JavaScript months range from 0 to 11
          parseInt(value.split("-")[2])
        )
      );
      inputDate.setUTCHours(dateHourWithOffset().getUTCHours());
      inputDate.setUTCMinutes(dateHourWithOffset().getUTCMinutes());
      inputDate.setUTCSeconds(dateHourWithOffset().getUTCSeconds());
      inputDate.setUTCMilliseconds(dateHourWithOffset().getUTCMilliseconds());

      // We check if the date is invalid or in the past.
      if (inputDate < dateHourWithOffset()) {
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
  routeId: joi.number().integer().greater(0).invalid(0).required(),
  companyId: joi.number().integer().greater(0).invalid(0).required(),
  hoursTariffs: joi
    .array()
    .min(1)
    .items(
      joi
        .object({
          hour: joi
            .string()
            .trim()
            .required()
            .pattern(/^([01][0-9]|2[0-3]):([0-5][0-9])$/),
          tariff: joi.number().integer().min(1000).required(),
        })
        .unknown(false) // This is to ensure that there are no additional fields in the object.
    )
    .required()
    .custom((value, helpers) => {
      const hours = value.map((item) => item.hour);
      const uniqueHours = [...new Set(hours)];

      if (hours.length !== uniqueHours.length) {
        return helpers.error("array.unique", {
          message: "Every hour must be unique",
        });
      }

      return value; // If everything is fine, return the value as is
    }, "Every hour is unique"),
});

// .greater(new Date().toISOString().split("T")[0])
const editSchema = joi.object({
  id: joi.number().integer().greater(0).invalid(0).required(),
  date: joi.string()
    .pattern(/^\d{4}-\d{2}-\d{2}$/)
    .custom((value, helpers) => {
      const inputDate = new Date(
        Date.UTC(
          parseInt(value.split("-")[0]),
          parseInt(value.split("-")[1]) - 1, // JavaScript months range from 0 to 11
          parseInt(value.split("-")[2])
        )
      );
      inputDate.setUTCHours(dateHourWithOffset().getUTCHours());
      inputDate.setUTCMinutes(dateHourWithOffset().getUTCMinutes());
      inputDate.setUTCSeconds(dateHourWithOffset().getUTCSeconds());
      inputDate.setUTCMilliseconds(dateHourWithOffset().getUTCMilliseconds());

      // We check if the date is invalid or in the past.
      if (inputDate < dateHourWithOffset()) {
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
  routeId: joi.number().integer().greater(0).invalid(0).required(),
  companyId: joi.number().integer().greater(0).invalid(0).required(),
});

const getAllSchema = joi.object({
  routeId: joi.number().integer().greater(0).invalid(0).required(),
  companyId: joi.number().integer().greater(0).invalid(0).required(),
  number: joi.number().integer().greater(0).required(),
  size: joi.number().integer().greater(0).required(),
});

const getOneSchema = joi.object({
  id: joi.number().integer().greater(0).invalid(0).required(),
});

const postDeleteSchema = joi.object({
  id: joi.number().integer().greater(0).invalid(0).required(),
  routeId: joi.number().integer().greater(0).invalid(0).required(),
  companyId: joi.number().integer().greater(0).invalid(0).required(),
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
  vWebPostRegister: async (inputData) => {
    return await use_validator_on_data(registerSchema, inputData);
  },
  vWebPostRegisterWithHour: async (inputData) => {
    return await use_validator_on_data(registerWithHourSchema, inputData);
  },
  vWebPostEdit: async (inputData) => {
    return await use_validator_on_data(editSchema, inputData);
  },
  vWebGetAll: async (inputData) => {
    return await use_validator_on_data(getAllSchema, inputData);
  },
  vWebGetOneById: async (inputData) => {
    return await use_validator_on_data(getOneSchema, inputData);
  },
  vWebPostDelete: async (inputData) => {
    return await use_validator_on_data(postDeleteSchema, inputData);
  },
};
