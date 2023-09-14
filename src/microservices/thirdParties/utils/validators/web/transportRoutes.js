const { StatusCodes } = require("http-status-codes");
const joi = require("joi");

// ------------ Functions and constants
const dayInMilliseconds = 24 * 60 * 60 * 1000;
const timePattern = /(2[0-3]|[01][0-9]):[0-5][0-9]/;
const EXCEL_BASE_DATE = new Date(1900, 0, 1); // 1/01/1900

function convertSerialDateToJSDate(serial) {
  let tempDate = new Date(EXCEL_BASE_DATE.getTime());
  tempDate.setDate(tempDate.getDate() + serial - 2); // We subtract 2 because Excel erroneously counts February 29, 1900 (although 1900 was not a leap year).
  return tempDate;
}

function convertJSDatetoExcelSerial(date) {
  const diff = date - EXCEL_BASE_DATE;
  return Math.floor(diff / dayInMilliseconds) + 2; // Sumamos 2 por la misma razón que restamos 2 en la función anterior.
}

// ------------ Validators
const routesSchema = joi.object({
  origin: joi.number().integer().greater(0).invalid(0).required(),
  destination: joi.number().integer().greater(0).invalid(0).required(),
  companyId: joi.number().integer().greater(0).invalid(0).required(),
  duration: joi.string().trim().required()
    .pattern(/^([01][0-9]|2[0-3]):([0-5][0-9])$/)
    .custom((value, helpers) => {
      return value + ":00";
    }, "Add Seconds"),
});

const editSchema = joi.object({
  id: joi.number().integer().empty("").greater(0).invalid(0).required(),
  origin: joi.number().integer().greater(0).invalid(0),
  destination: joi.number().integer().greater(0).invalid(0),
  companyId: joi.number().integer().greater(0).invalid(0).required(),
  duration: joi.string().trim()
    .pattern(/^([01][0-9]|2[0-3]):([0-5][0-9])$/)
    .custom((value, helpers) => {
      return value + ":00";
    }, "Add Seconds"),
});

const postDeleteSchema = joi.object({
  id: joi.number().empty("").greater(0).invalid(0).required(),
  companyId: joi.number().integer().greater(0).invalid(0).required(),
});

const getRoutesSchema = joi.object({
  companyId: joi.number().integer().greater(0).invalid(0).required(),
  number: joi.number().integer().greater(0).required(),
  size: joi.number().integer().greater(0).required(),
});

const getCompaniesRoutesSchema = joi.object({
  routeId: joi.number().integer().greater(0).required(),
  // number: joi.number().integer().greater(0).required(),
  // size: joi.number().integer().greater(0).required(),
});

const companySchema = joi.object({
  companyId: joi.number().integer().greater(0).invalid(0).required(),
});

const multerMemorySingleItemSchema = joi.object({
  fieldname: joi.string().required(),
  originalname: joi.string().required(),
  encoding: joi.string().required(),
  mimetype: joi.string().required(),
  size: joi.number().required(),
  buffer: joi.binary().required(),
}).required().error(new Error('A valid file is required.'));

const excelPagesSchema = joi.array().min(1).items(joi.object({
  name: joi.string().required(),
}));

const excelHeaderSchema = joi.object({
  header: joi.array().items(joi.string()).required(),
});

const excelRouteSchema = joi.object({
  origin: joi.string().trim().required()
    .pattern(/^[^,]+, [^,]+, \d+$/)
    .message('The origin field must be in the format "city, state, city code"'),
  destination: joi.string().trim().required()
    .pattern(/^[^,]+, [^,]+, \d+$/)
    .message(
      'The destination field must be in the format "city, state, city code".'
    ),
  startDate: joi.number().required().integer()
    .min(convertJSDatetoExcelSerial(new Date()))
    .custom((value, helpers) => {
      const date = convertSerialDateToJSDate(value);

      if (isNaN(date)) {
        return helpers.error("any.invalid");
      }

      const y = date.getFullYear();
      const m = String(date.getMonth() + 1).padStart(2, "0");
      const d = String(date.getDate()).padStart(2, "0");
      return `${y}-${m}-${d}`;
    }, "Date Transformation from Excel Serial")
    .error((errors) => {
      for (let error of errors) {
        // const label = error.local?.label || "value";
        switch (error.code) {
          case "number.base":
            error.message = `"Fecha inicio" must be a number.`;
            break;
          case "any.required":
            error.message = `"Fecha inicio" is required.`;
            break;
          case "number.integer":
            error.message = `"Fecha inicio" must be an integer.`;
            break;
          case "number.min":
            error.message = `"Fecha inicio" should not be in the past.`;
            break;
          case "any.invalid":
            error.message = `"Fecha inicio" contains an invalid date.`;
            break;
          default:
            error.message = `"Fecha inicio" has an invalid value.`;
            break;
        }
      }
      return errors;
    }),
  endDate: joi.number().required().integer()
    .min(convertJSDatetoExcelSerial(new Date()))
    .custom((value, helpers) => {
      const date = convertSerialDateToJSDate(value);

      if (isNaN(date)) {
        return helpers.error("any.invalid");
      }

      const y = date.getFullYear();
      const m = String(date.getMonth() + 1).padStart(2, "0");
      const d = String(date.getDate()).padStart(2, "0");
      return `${y}-${m}-${d}`;
    }, "Date Transformation from Excel Serial")
    .error((errors) => {
      for (let error of errors) {
        // const label = error.local?.label || "value";
        switch (error.code) {
          case "number.base":
            error.message = `"Fecha fin" must be a number.`;
            break;
          case "any.required":
            error.message = `"Fecha fin" is required.`;
            break;
          case "number.integer":
            error.message = `"Fecha fin" must be an integer.`;
            break;
          case "number.min":
            error.message = `"Fecha fin" should not be in the past.`;
            break;
          case "any.invalid":
            error.message = `"Fecha fin" contains an invalid date.`;
            break;
          default:
            error.message = `"Fecha fin" has an invalid value.`;
            break;
        }
      }
      return errors;
    }),
});

const rowTimetableExcelSchema = joi.object({
  date: joi.number().required().integer()
    .min(convertJSDatetoExcelSerial(new Date()))
    .custom((value, helpers) => {
      const date = convertSerialDateToJSDate(value);

      if (isNaN(date)) {
        return helpers.error("any.invalid");
      }

      const y = date.getFullYear();
      const m = String(date.getMonth() + 1).padStart(2, "0");
      const d = String(date.getDate()).padStart(2, "0");
      return `${y}-${m}-${d}`;
    }, "Date Transformation from Excel Serial")
    .error((errors) => {
      for (let error of errors) {
        // const label = error.local?.label || "value";
        switch (error.code) {
          case "number.base":
            error.message = `"Fecha" must be a number.`;
            break;
          case "any.required":
            error.message = `"Fecha" is required.`;
            break;
          case "number.integer":
            error.message = `"Fecha" must be an integer.`;
            break;
          case "number.min":
            error.message = `"Fecha" should not be in the past.`;
            break;
          case "any.invalid":
            error.message = `"Fecha" contains an invalid date.`;
            break;
          default:
            error.message = `"Fecha" has an invalid value.`;
            break;
        }
      }
      return errors;
    }),
  startTime: joi.string().required()
    .pattern(new RegExp(`^${timePattern.source}(,\\s?${timePattern.source})*$`))
    .custom((value, helpers) => {
      // Convert the string "hh:mm, hh:mm, ..." to an array ["hh:mm", "hh:mm", ...].
      const times = value.split(",").map((time) => time.trim());

      if (new Set(times).size !== times.length) {
        // If there are duplicate hours, return an error
        return helpers.error("any.invalid");
      }
      return times; // Return the resulting array
    }, "Time Splitting and Deduplication")
    .error((errors) => {
      for (let error of errors) {
        // const label = error.local?.label || "value";
        switch (error.code) {
          case "string.pattern.base":
            error.message = `"Horas" must be in the format "hh:mm, hh:mm, ...`;
            break;
          case "any.required":
            error.message = `"Horas" is required.`;
            break;
          case "any.invalid":
            error.message = `"Horas" contains duplicate times.`;
            break;
          default:
            error.message = `"Horas" has an invalid value.`;
            break;
        }
      }
      return errors;
    }),
  tariff: joi.number().integer().min(1000).required(),
  duration: joi.string().trim().required()
    .pattern(/^([01][0-9]|2[0-3]):([0-5][0-9])$/)
    .custom((value, helpers) => {
      return value + ":00";
    }, "Add Seconds"),
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
    return await use_validator_on_data(routesSchema, inputData);
  },
  vWebPostEdit: async (inputData) => {
    return await use_validator_on_data(editSchema, inputData);
  },
  vWebPostDelete: async (inputData) => {
    return await use_validator_on_data(postDeleteSchema, inputData);
  },
  vWebGetListRoutes: async (inputData) => {
    return await use_validator_on_data(getRoutesSchema, inputData);
  },
  vWebGetListCompaniesNRoutes: async (inputData) => {
    return await use_validator_on_data(getCompaniesRoutesSchema, inputData);
  },
  // Start - XLS - Upload
  vWebPostUploadXlsxRoutes: async (inputData) => {
    return await use_validator_on_data(companySchema, inputData);
  },
  vMulterMemorySingleItemSchema: async (inputData) => {
    return await use_validator_on_data(multerMemorySingleItemSchema, inputData);
  },
  vRExcelHeaderSchema: async (inputData) => {
    return await use_validator_on_data(excelHeaderSchema, inputData);
  },
  vRExcelRouteSchema: async (inputData) => {
    return await use_validator_on_data(excelRouteSchema, inputData);
  },
  vRExcelPagesSchema: async (inputData) => {
    return await use_validator_on_data(excelPagesSchema, inputData);
  },
  vRTimetableSchema: async (inputData) => {
    return await use_validator_on_data(rowTimetableExcelSchema, inputData);
  },
  // End - XLS - Upload
};
