const { StatusCodes } = require("http-status-codes");
const joi = require("joi");
const polygonCali = require("../../../../../utils/polygonCali.js");
const { dateHourWithOffset } = require("../../../../../utils/utcZone");

const uri_string = joi.string().trim().empty("").invalid(" ").regex(/[(http(s)?):\/\/(www\.)?a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/).messages({
  'string.pattern.base': 'The siteUri must be a valid url',
});

const registerSchema = joi.object({
  name: joi.string().trim().empty("").invalid(" ").regex(/^[a-zA-ZñÑáéíóúÁÉÍÓÚüÜ\s0-9]+$/, 'Alphanumeric characters only').max(50).required(),
  nit: joi.string().trim().empty("").invalid(" ").max(50).regex(/^\d+-\d$/).messages({
      'string.pattern.base': 'The NIT must be in the format of numbers + "-" + verification digit',
    }),
  categoryId: joi.number().integer().greater(0).invalid(0).required(),
  description: joi.string().trim().empty("").invalid(" ").regex(/^[a-zA-ZñÑáéíóúÁÉÍÓÚüÜ\s0-9]+$/, 'Alphanumeric characters only').max(200).required(),
  address: joi.string().trim().empty("").invalid(" ").max(255).required(),
  phone: joi.string().trim().empty("").invalid(" ").regex(/^[0-9]*$/, 'Numeric String').length(10).required(),
  imageUri: uri_string.required(),
  siteUri: uri_string,
  lat: joi.number().min(-90).max(90).required(),
  lon: joi.number().min(-180).max(180).required(),
}).custom((value, helpers) => {
    if (!polygonCali.isLocationInCali(value.lat, value.lon)) {
      return helpers.message("lat and lon must belong to the area of the municipality of Cali, Valle del Cauca, Colombia");
    }
    return value;
});

const apiKeySchema = joi.object({
  expirationAt: joi.string().required()
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
            err.message = `"expirationAt" format must be aaaa-mm-dd.`;
            break;
          case "any.required":
            err.message = `"expirationAt" is required.`;
            break;
          case "array.greaterThan":
            err.message = `"expirationAt" must be greater than the current date.`;
            break;
          default:
            err.message = `"expirationAt" item has an invalid value.`;
            break;
        }
      });
      return errors;
    }),
  companyId: joi.number().integer().greater(0).invalid(0).required(),
});

const getApiKeySchema = joi.object({
  companyId: joi.number().integer().greater(0).invalid(0).required(),
});

const editSchema = joi.object({
  id: joi.number().integer().greater(0).invalid(0).required(),
  name: joi.string().trim().empty("").invalid(" ").regex(/^[a-zA-ZñÑáéíóúÁÉÍÓÚüÜ\s0-9]+$/, 'Alphanumeric characters only').max(50),
  nit: joi.string().trim().empty("").invalid(" ").max(50).regex(/^\d+-\d$/).messages({
      'string.pattern.base': 'The NIT must be in the format of numbers + "-" + verification digit',
    }),
  categoryId: joi.number().integer().greater(0).invalid(0),
  description: joi.string().trim().empty("").invalid(" ").regex(/^[a-zA-ZñÑáéíóúÁÉÍÓÚüÜ\s0-9]+$/, 'Alphanumeric characters only').max(200),
  address: joi.string().trim().empty("").invalid(" ").max(255),
  phone: joi.string().trim().empty("").invalid(" ").regex(/^[0-9]*$/, 'Numeric String').length(10),
  imageUri: uri_string,
  siteUri: uri_string,
  lat: joi.number().min(-90).max(90).when('address', {
    is: joi.exist(),
    then: joi.required()
  }),
  lon: joi.number().min(-180).max(180).when('address', {
    is: joi.exist(),
    then: joi.required()
  })
}).and('lat', 'lon').with('lat', 'address').with('lon', 'address').custom((data, helpers) => {
  if (!isNaN(parseFloat(data.lat)) && !isNaN(parseFloat(data.lon))) {
    if (!polygonCali.isLocationInCali(data.lat, data.lon)) {
      // return helpers.error("any.invalid", {
      //   message: "lat and lon must be within the municipality of Cali, Valle del Cauca, Colombia",
      // });
      return helpers.message("lat and lon must belong to the area of the municipality of Cali, Valle del Cauca, Colombia");
    }
    return data;
  }
  return data;
});


const getProfile = joi.object({
  id: joi.number().integer().greater(0).invalid(0).required(),
});

const getListAllSchema = joi.object({
  number: joi.number().integer().greater(0).required(),
  size: joi.number().integer().greater(0).required(),
});

const postDeleteSchema = joi.object({
  id: joi.number().integer().greater(0).invalid(0).required(),
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
  vWebGetProfile: async (inputData) => {
    return await use_validator_on_data(getProfile, inputData);
  },
  vWebGetListAll: async (inputData) => {
    return await use_validator_on_data(getListAllSchema, inputData);
  },
  vWebPostDelete: async (inputData) => {
    return await use_validator_on_data(postDeleteSchema, inputData);
  },
  vWebPostApiKey: async (inputData) => {
    return await use_validator_on_data(apiKeySchema, inputData);
  },
  vWebGetApiKey: async (inputData) => {
    return await use_validator_on_data(getApiKeySchema, inputData);
  },
};
