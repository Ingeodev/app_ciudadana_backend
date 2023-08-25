const { StatusCodes } = require("http-status-codes");
const joi = require("joi");

const uri_string = joi.string().uri();
const integer_number = joi.number().integer();
const positive_integer = integer_number.positive();
const non_negative_integer = integer_number.min(0);
const hex_color_string = joi.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Hexadecimal Color Code');

const page_object = joi.object({
  size: positive_integer.label('page[size]').required(),
  number: positive_integer.label('page[number]').required(),
});

const advertisementSchema = joi.object({
  imageUri: uri_string.required(),
  siteUri: uri_string.required(),
  categoryId: integer_number,
});

const editAdvertisementSchema = joi.object({
  id: non_negative_integer.required(),
  imageUri: uri_string,
  siteUri: uri_string,
  categoryId: integer_number.allow(null),
  active: joi.bool(),
}).or('imageUri', 'siteUri', 'categoryId', 'active');

const statusAdvertisementSchema = joi.object({
  id: non_negative_integer.required(),
  active: joi.bool().required(),
});

const simpleDeleteByIdSchema = joi.object({
  id: non_negative_integer.required()
});

const advertisementCategorySchema = joi.object({
  name: joi.string().trim().min(3).required(),
  color: hex_color_string.required(),
});

const editAdvertisementCategorySchema = joi.object({
  id: non_negative_integer.required(),
  name: joi.string().trim().min(3),
  color: hex_color_string,
}).or('name', 'color');

const alertSchema = joi.object({
  title: joi.string().required(),
  message: joi.string().required(),
  push: joi.bool().required(),
  sms: joi.bool().required(),
  alertList: joi.bool().required(),
  siteUri: uri_string.required(),
  imageUri: uri_string.required(),
  expiresAt: joi.date().greater('now'),
});

const simplePaginationSchema = joi.object({
  page: page_object.required(),
});

const getAlertsListAllSchema = joi.object({
  number: joi.number().integer().greater(0).required(),
  size: joi.number().integer().greater(0).required(),
});

const registerPushSchema = joi.object({
  deviceToken: joi.string().trim().min(5).required(),
});

const multerMemorySingleItemSchema = joi.object({
  fieldname: joi.string().required(),
  originalname: joi.string().required(),
  encoding: joi.string().required(),
  mimetype: joi.string().required(),
  size: joi.number().required(),
  buffer: joi.binary().required(),
}).required().error(new Error('A valid file is required.'));


/**
 * Asyncronously uses the `validator_schema` to validate the incoming `data` with Joi.
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
  validateAdvertisementSchema: async (inputData) => {
    return await use_validator_on_data(advertisementSchema, inputData);
  },
  validateEditAdvertisementSchema: async (inputData) => {
    return await use_validator_on_data(editAdvertisementSchema, inputData);
  },
  validateStatusAdvertisementSchema: async (inputData) => {
    return await use_validator_on_data(statusAdvertisementSchema, inputData);
  },
  validateSimpleDeleteByIdSchema: async (inputData) => {
    return await use_validator_on_data(simpleDeleteByIdSchema, inputData);
  },
  validateAdvertisementCategorySchema: async (inputData) => {
    return await use_validator_on_data(advertisementCategorySchema, inputData);
  },
  validateEditAdvertisementCategorySchema: async (inputData) => {
    return await use_validator_on_data(editAdvertisementCategorySchema, inputData);
  },
  validateAlertSchema: async (inputData) => {
    return await use_validator_on_data(alertSchema, inputData);
  },
  validateRegisterPushSchema: async (inputData) => {
    return await use_validator_on_data(registerPushSchema, inputData);
  },
  validateSimplePaginationSchema: async (inputData) => {
    return await use_validator_on_data(simplePaginationSchema, inputData);
  },
  vGetAlertsListAll: async (inputData) => {
    return await use_validator_on_data(getAlertsListAllSchema, inputData);
  },
  validateMulterMemorySingleItemSchema: async inputData => {
    return await use_validator_on_data(multerMemorySingleItemSchema, inputData);
  },
};
