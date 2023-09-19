const { StatusCodes } = require("http-status-codes");
const joi = require("joi");

// ------------ Functions and constants - Excel
// const dayInMilliseconds = 24 * 60 * 60 * 1000;
// const timePattern = /(2[0-3]|[01][0-9]):[0-5][0-9]/;
// const EXCEL_BASE_DATE = new Date(1900, 0, 1); // 1/01/1900

// function convertSerialDateToJSDate(serial) {
//   let tempDate = new Date(EXCEL_BASE_DATE.getTime());
//   tempDate.setDate(tempDate.getDate() + serial - 2); // We subtract 2 because Excel erroneously counts February 29, 1900 (although 1900 was not a leap year).
//   return tempDate;
// }

// function convertJSDatetoExcelSerial(date) {
//   const diff = date - EXCEL_BASE_DATE;
//   return Math.floor(diff / dayInMilliseconds) + 2; // Sumamos 2 por la misma razón que restamos 2 en la función anterior.
// }

// ------------ Validators
const routesSchema = joi.object({
  originId: joi.number().integer().greater(0).invalid(0).required(),
  destinationId: joi.number().integer().greater(0).invalid(0).required(),
  companyId: joi.number().integer().greater(0).invalid(0).required(),
  duration: joi.string().trim().required()
    .pattern(/^([01][0-9]|2[0-3]):([0-5][0-9])$/),
    // .custom((value, helpers) => {
    //   return value + ":00";
    // }, "Add Seconds"),
});

const editSchema = joi.object({
  id: joi.number().integer().empty("").greater(0).invalid(0).required(),
  originId: joi.number().integer().greater(0).invalid(0).required(),
  destinationId: joi.number().integer().greater(0).invalid(0).required(),
  companyId: joi.number().integer().greater(0).invalid(0).required(),
  duration: joi.string().trim()
    .pattern(/^([01][0-9]|2[0-3]):([0-5][0-9])$/),
    // .custom((value, helpers) => {
    //   return value + ":00";
    // }, "Add Seconds"),
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
  number: joi.number().integer().greater(0).required(),
  size: joi.number().integer().greater(0).required(),
});

const getItinerarySchema = joi.object({
  routeId: joi.number().integer().greater(0).required()
});

// ---------- Excel - Start -----------------------
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

const numPage = 1;
const numCol = 6;
const numRow = 2;

const excelPagesSchema = joi
  .array()
  .items(
    joi.object({
      name: joi.string().required(),
      data: joi.array().min(numRow).items(joi.array().length(numCol)),
      // data: joi.array().min(2).items(joi.array().length(2).items(
      //   joi.alternatives([non_negative_integer, joi.string().max(200)])
      // )),
    }),
  );

const excelHeaderSchema = joi.object({
  header: joi.array().items(joi.string()).required(),
});


const excelRouteSchema = joi.object({
  originCode: joi
    .number()
    .required()
    .integer()
    .greater(0)
    .invalid(0)
    .error((errors) => {
      errors.forEach((err) => {
        switch (err.code) {
          case "number.base":
            err.message = `El código del Municipio de origen debe ser un número`;
            break;
          case "any.required":
            err.message = `El código del Municipio de origen es requerido`;
            break;
          case "number.integer":
            err.message = `El código del Municipio de origen debe ser un entero`;
            break;
          case "number.greater":
            err.message = `El código del Municipio de origen debe ser mayor que 0`;
            break;
          default:
            err.message = `El código del Municipio de origen tiene un valor no válido`;
            break;
        }
      });
      return errors;
    }),
  destinationCode: joi
    .number()
    .required()
    .integer()
    .greater(0)
    .invalid(0)
    .error((errors) => {
      errors.forEach((err) => {
        switch (err.code) {
          case "number.base":
            err.message = `El código del Municipio de destino debe ser un número`;
            break;
          case "any.required":
            err.message = `El código del Municipio de destino es requerido`;
            break;
          case "number.integer":
            err.message = `El código del Municipio de destino debe ser un entero`;
            break;
          case "number.greater":
            err.message = `El código del Municipio de destino debe ser mayor que 0`;
            break;
          default:
            err.message = `El código del Municipio de destino tiene un valor no válido`;
            break;
        }
      });
      return errors;
    }),
  duration: joi
    .string()
    .trim()
    .required()
    .pattern(/^([01][0-9]|2[0-3]):([0-5][0-9])$/)
    // .custom((value, helpers) => {
    //   return value + ":00";
    // }, "Add Seconds")
    .error((errors) => {
      errors.forEach((err) => {
        switch (err.code) {
          case "string.pattern.base":
            err.message = "La duración del viaje debe ser en el formato (24h), hh:mm";
            break;
          case "any.required":
            err.message = `La duración del viaje es requerida`;
            break;
          default:
            err.message = `La duración del viaje tiene un valor no válido`;
            break;
        }
      });
      return errors;
    }),
  date: joi
    .string()
    .required()
    .pattern(/^(\d{4})-(\d{2})-(\d{2})$/)
    .custom((value, helpers) => {
      const currentDate = new Date();
      const inputDate = new Date(value);

      // We check if the date is invalid or in the past.
      if (isNaN(inputDate.getTime()) || inputDate < currentDate) {
        return helpers.error("any.invalid");
      }
      return value; // Return date if valid
    })
    .error((errors) => {
      errors.forEach((err) => {
        switch (err.code) {
          case "string.pattern.base":
            err.message = "La fecha debe ser en el formato aaaa-mm-dd";
            break;
          case "any.required":
            err.message = `La fecha es requerida`;
            break;
          case "any.invalid":
            err.message = "La fecha no debe ser del pasado";
            break;
          default:
            err.message = `La fecha tiene un valor no válido`;
            break;
        }
      });
      return errors;
    }),
  hour: joi
    .string()
    .trim()
    .required()
    .pattern(/^([01][0-9]|2[0-3]):([0-5][0-9])$/)
    .custom((value, helpers) => {
      return value + ":00";
    }, "Add Seconds")
    .error((errors) => {
      errors.forEach((err) => {
        switch (err.code) {
          case "string.pattern.base":
            err.message = "La hora de salida debe ser en el formato (24h), hh:mm";
            break;
          case "any.required":
            err.message = `La hora de salida es requerida`;
            break;
          default:
            err.message = `La hora de salida tiene un valor no válido`;
            break;
        }
      });
      return errors;
    }),
  tariff: joi.number().integer().min(0).required()
    .error((errors) => {
      errors.forEach((err) => {
        switch (err.code) {
          case "number.base":
            err.message = `La tarifa debe ser un número`;
            break;
          case "any.required":
            err.message = `La tarifa es requerida`;
            break;
          case "number.integer":
            err.message = `La tarifa debe ser un entero`;
            break;
          case "number.greater":
            err.message = `La tarifa debe ser mayor que 0`;
            break;
          default:
            err.message = `La tarifa tiene un valor no válido`;
            break;
        }
      });
      return errors;
    }),
});

// * Validation for a date in excel format, i.e. in numbers
// date: joi
//   .number()
//   .required()
//   .integer()
//   .min(convertJSDatetoExcelSerial(new Date()))
//   .custom((value, helpers) => {
//     const date = convertSerialDateToJSDate(value);
//     if (isNaN(date)) {
//       return helpers.error("any.invalid");
//     }
//     const y = date.getFullYear();
//     const m = String(date.getMonth() + 1).padStart(2, "0");
//     const d = String(date.getDate()).padStart(2, "0");
//     return `${y}-${m}-${d}`;
//   }, "Date Transformation from Excel Serial")
//   .error((errors) => {
//     for (let error of errors) {
//       // const label = error.local?.label || "value";
//       switch (error.code) {
//         case "number.base":
//           error.message = `"Fecha" must be a number.`;
//           break;
//         case "any.required":
//           error.message = `"Fecha" is required.`;
//           break;
//         case "number.integer":
//           error.message = `"Fecha" must be an integer.`;
//           break;
//         case "number.min":
//           error.message = `"Fecha" should not be in the past.`;
//           break;
//         case "any.invalid":
//           error.message = `"Fecha" contains an invalid date.`;
//           break;
//         default:
//           error.message = `"Fecha" has an invalid value.`;
//           break;
//       }
//     }
//     return errors;
//   }),

// * Validacion de array de horas [hh:mm, hh:mm, ...]
// startTime: joi.string().required()
//   .pattern(new RegExp(`^${timePattern.source}(,\\s?${timePattern.source})*$`))
//   .custom((value, helpers) => {
//     // Convert the string "hh:mm, hh:mm, ..." to an array ["hh:mm", "hh:mm", ...].
//     const times = value.split(",").map((time) => time.trim());

//     if (new Set(times).size !== times.length) {
//       // If there are duplicate hours, return an error
//       return helpers.error("any.invalid");
//     }
//     return times; // Return the resulting array
//   }, "Time Splitting and Deduplication")
//   .error((errors) => {
//     for (let error of errors) {
//       // const label = error.local?.label || "value";
//       switch (error.code) {
//         case "string.pattern.base":
//           error.message = `"Horas" must be in the format "hh:mm, hh:mm, ...`;
//           break;
//         case "any.required":
//           error.message = `"Horas" is required.`;
//           break;
//         case "any.invalid":
//           error.message = `"Horas" contains duplicate times.`;
//           break;
//         default:
//           error.message = `"Horas" has an invalid value.`;
//           break;
//       }
//     }
//     return errors;
//   }),

// ---------- Excel - End -----------------------

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
  vWebGetItinerary: async (inputData) => {
    return await use_validator_on_data(getItinerarySchema, inputData);
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
  // End - XLS - Upload
};
