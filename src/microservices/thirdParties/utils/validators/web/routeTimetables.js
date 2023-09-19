const { StatusCodes } = require("http-status-codes");
const joi = require("joi");

// .greater(new Date().toISOString().split("T")[0])
const registerSchema = joi.object({
  date: joi
    .string()
    .required()
    .pattern(/^\d{4}-\d{2}-\d{2}$/)
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
          default:
            err.message = `"date" item has an invalid value.`;
            break;
        }
      });
      return errors;
    }),
  // startTime: joi
  //   .array()
  //   .required()
  //   .items(
  //     joi
  //       .string()
  //       .pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
  //       .error((errors) => {
  //         for (let error of errors) {
  //           // const label = error.local?.label || "value";
  //           switch (error.code) {
  //             case "string.pattern.base":
  //               error.message = `timetable item must be in the format "hh:mm"`;
  //               break;
  //             default:
  //               error.message = `timetable item has an invalid value.`;
  //               break;
  //           }
  //         }
  //         return errors;
  //       })
  //   )
  //   .error((errors) => {
  //     for (let error of errors) {
  //       // const label = error.local?.label || "value";
  //       switch (error.code) {
  //         case "any.required":
  //           error.message = `"timetables" is required.`;
  //           break;
  //         default:
  //           error.message = `"timetables" has an invalid value.`;
  //           break;
  //       }
  //     }
  //     return errors;
  //   }),
  routeId: joi.number().integer().empty("").greater(0).invalid(0).required(),
  companyId: joi.number().integer().empty("").greater(0).invalid(0).required(),
  // tariff: joi.number().integer().min(1000).required(),
  // duration: joi.string().trim().required()
  //   .pattern(/^([01][0-9]|2[0-3]):([0-5][0-9])$/)
  //   .custom((value, helpers) => {
  //     return value + ":00";
  //   }, "Add Seconds"),
});

// .greater(new Date().toISOString().split("T")[0])
const editSchema = joi.object({
  id: joi.number().integer().empty("").greater(0).invalid(0).required(),
  date: joi
    .string()
    .pattern(/^\d{4}-\d{2}-\d{2}$/)
    .error((errors) => {
      errors.forEach((err) => {
        // const label = err.local?.label || "value";
        switch (err.code) {
          case "string.pattern.base":
            err.message = `"date" format must be aaaa-mm-dd.`;
            break;
          default:
            err.message = `"date" item has an invalid value.`;
            break;
        }
      });
      return errors;
    }),
  // startTime: joi
  //   .array()
  //   .items(
  //     joi
  //       .string()
  //       .pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
  //       .error((errors) => {
  //         for (let error of errors) {
  //           // const label = error.local?.label || "value";
  //           switch (error.code) {
  //             case "string.pattern.base":
  //               error.message = `timetable item must be in the format "hh:mm"`;
  //               break;
  //             default:
  //               error.message = `timetable item has an invalid value.`;
  //               break;
  //           }
  //         }
  //         return errors;
  //       })
  //   )
  //   .error((errors) => {
  //     for (let error of errors) {
  //       // const label = error.local?.label || "value";
  //       switch (error.code) {
  //         default:
  //           error.message = `"timetables" has an invalid value.`;
  //           break;
  //       }
  //     }
  //     return errors;
  //   }),
  routeId: joi.number().integer().empty("").greater(0).invalid(0).required(),
  companyId: joi.number().integer().empty("").greater(0).invalid(0).required(),
  // tariff: joi.number().integer().min(1000),
  // duration: joi.string().trim()
  //   .pattern(/^([01][0-9]|2[0-3]):([0-5][0-9])$/)
  //   .custom((value, helpers) => {
  //     return value + ":00";
  //   }, "Add Seconds"),
});

const getAllSchema = joi.object({
  routeId: joi.number().integer().empty("").greater(0).invalid(0).required(),
  companyId: joi.number().integer().empty("").greater(0).invalid(0).required(),
  number: joi.number().integer().greater(0).required(),
  size: joi.number().integer().greater(0).required(),
});

const getOneSchema = joi.object({
  id: joi.number().empty("").greater(0).invalid(0).required(),
});

const postDeleteSchema = joi.object({
  id: joi.number().empty("").greater(0).invalid(0).required(),
  routeId: joi.number().integer().empty("").greater(0).invalid(0).required(),
  companyId: joi.number().integer().empty("").greater(0).invalid(0).required(),
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
