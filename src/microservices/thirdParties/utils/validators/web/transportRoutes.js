const { StatusCodes } = require("http-status-codes");
const joi = require("joi");
const { dateHourWithOffset } = require("../../../../../utils/utcZone");

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
  id: joi.number().integer().greater(0).invalid(0).required(),
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
  id: joi.number().integer().greater(0).invalid(0).required(),
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

const getCompanyNRoutesSchema = joi.object({
  number: joi.number().integer().greater(0).required(),
  size: joi.number().integer().greater(0).required(),
  companyId: joi.number().integer().greater(0).required(),
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
      const inputDate = new Date(
        Date.UTC(
          parseInt(value.split("-")[0]),
          parseInt(value.split("-")[1]) - 1, // Los meses en JavaScript van de 0 a 11
          parseInt(value.split("-")[2])
        )
      );
      inputDate.setUTCHours(dateHourWithOffset().getUTCHours());
      inputDate.setUTCMinutes(dateHourWithOffset().getUTCMinutes());
      inputDate.setUTCSeconds(dateHourWithOffset().getUTCSeconds());
      inputDate.setUTCMilliseconds(dateHourWithOffset().getUTCMilliseconds());

      // We check if the date is invalid or in the past.
      if (inputDate < dateHourWithOffset()) {
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
  tariff: joi
    .number()
    .integer()
    .min(0)
    .required()
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
  vWebGetCompanyNRoutes: async (inputData) => {
    return await use_validator_on_data(getCompanyNRoutesSchema, inputData);
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
