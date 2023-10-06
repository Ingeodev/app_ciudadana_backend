const { StatusCodes } = require("http-status-codes");
const joi = require("joi");
const { isInCaliCustomJoiValidator } = require("../../../utils/validator");

const uri_string = joi.string().uri({ allowRelative: true });
const integer_number = joi.number().integer();
const positive_integer = integer_number.positive();
const non_negative_integer = integer_number.min(0);
const hex_color_string = joi.string().trim().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Hexadecimal Color Code');
const numberic_string = joi.string().trim().regex(/^[0-9]*$/, 'Numeric String');
const latitude_number = joi.number().min(-90).max(90);
const longitude_number = joi.number().min(-180).max(180);

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

const simpleIdSchema = joi.object({
  id: non_negative_integer.required()
});

const advertisementCategorySchema = joi.object({
  name: joi.string().trim().empty("").invalid(" ").regex(/^[a-zA-ZñÑáéíóúÁÉÍÓÚüÜ\s0-9]+$/, 'Alphanumeric characters only').min(3).required(),
  color: hex_color_string.required(),
});

const editAdvertisementCategorySchema = joi.object({
  id: non_negative_integer.required(),
  name: joi.string().trim().empty("").invalid(" ").regex(/^[a-zA-ZñÑáéíóúÁÉÍÓÚüÜ\s0-9]+$/, 'Alphanumeric characters only').min(3),
  color: hex_color_string,
}).or('name', 'color');

const alertSchema = joi.object({
  title: joi.string().trim().empty("").invalid(" ").regex(/^[a-zA-ZñÑáéíóúÁÉÍÓÚüÜ\s0-9]+$/, 'Alphanumeric characters only').max(50).required(),
  message: joi.string().required(),
  push: joi.bool().required(),
  sms: joi.bool().required(),
  siteUri: uri_string,
  imageUri: uri_string,
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

const dependenciesExcelContentsSchema = joi.array().length(1).items(joi.object({
  name: joi.string(),
  data: joi.array().min(2).items(joi.array().length(2).items(
    joi.alternatives([non_negative_integer, joi.string().max(200)])
  )),
}));

const dependencySchema = joi.object({
  id: non_negative_integer.required(),
  name: joi.string().max(200).required(),
});

const multerMemorySingleItemSchema = joi.object({
  fieldname: joi.string().required(),
  originalname: joi.string().required(),
  encoding: joi.string().required(),
  mimetype: joi.string().required(),
  size: joi.number().required(),
  buffer: joi.binary().required(),
}).required().error(new Error('A valid file is required.'));

const securityAttentionPointCreationSchema = joi.object({
  name: joi.string().trim().empty("").invalid(" ").regex(/^[a-zA-ZñÑáéíóúÁÉÍÓÚüÜ\s0-9]+$/, 'Alphanumeric characters only').max(50).required(),
  description: joi.string().trim().empty("").invalid(" ").regex(/^[a-zA-ZñÑáéíóúÁÉÍÓÚüÜ\s0-9]+$/, 'Alphanumeric characters only').max(200).required(),
  phone: numberic_string.min(10).max(15).required(),
  color: hex_color_string.required(),
  address: joi.string().trim().empty("").invalid(" ").required(),
  imageUri: uri_string.required(),
  lat: latitude_number.required(),
  lon: longitude_number.required(),
}).custom(isInCaliCustomJoiValidator);

const securityAttentionPointUpdateSchema = joi.object({
  id: non_negative_integer.required(),
  name: joi.string().trim().empty("").invalid(" ").regex(/^[a-zA-ZñÑáéíóúÁÉÍÓÚüÜ\s0-9]+$/, 'Alphanumeric characters only').max(50),
  description: joi.string().trim().empty("").invalid(" ").regex(/^[a-zA-ZñÑáéíóúÁÉÍÓÚüÜ\s0-9]+$/, 'Alphanumeric characters only').max(200),
  phone: numberic_string.min(10).max(15),
  color: hex_color_string,
  address: joi.string().trim().empty("").invalid(" "),
  imageUri: uri_string,
  lat: latitude_number,
  lon: longitude_number,
}).or('name', 'description', 'phone', 'color', 'address', 'imageUri', 'lat', 'lon')
  .and('lat', 'lon')
  .custom(isInCaliCustomJoiValidator);

const optionalLocationSchema = joi.object({
  lat: latitude_number,
  lon: longitude_number,
}).and('lat', 'lon');

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
  validateSimpleIdSchema: async (inputData) => {
    return await use_validator_on_data(simpleIdSchema, inputData);
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
  validateDependenciesExcelContentsSchema: async (inputData) => {
    return await use_validator_on_data(dependenciesExcelContentsSchema, inputData);
  },
  validateDependencySchema: async (inputData) => {
    return await use_validator_on_data(dependencySchema, inputData);
  },
  validateMulterMemorySingleItemSchema: async inputData => {
    return await use_validator_on_data(multerMemorySingleItemSchema, inputData);
  },
  validateSecurityAttentionPointCreationSchema: async inputData => {
    return await use_validator_on_data(securityAttentionPointCreationSchema, inputData);
  },
  validateSecurityAttentionPointUpdateSchema: async inputData => {
    return await use_validator_on_data(securityAttentionPointUpdateSchema, inputData);
  },
  validateOptionalLocationSchema: async inputData => {
    return await use_validator_on_data(optionalLocationSchema, inputData);
  },
};
