const { StatusCodes } = require("http-status-codes");
const joi = require("joi");

const namesRegex = /^[a-zA-ZÀ-ÿ\u00f1\u00d1\s]+$/;
const corporationRegex = /^[a-zA-Z\s]+$/;
const digitsOnly = /^[0-9]+$/;

const postRegisterSchema = joi.object({
  typeSol: joi.number().integer().min(1).max(5).required(),
  firstName: joi.string().trim().regex(namesRegex, 'Alphabetic characters only').required(),
  secondName: joi.string().trim().allow('').regex(namesRegex, 'Alphabetic characters only').optional(),
  firstLastName: joi.string().trim().regex(namesRegex, 'Alphabetic characters only').required(),
  secondLastName: joi.string().trim().allow('').regex(namesRegex, 'Alphabetic characters only').optional(),
  documentTypeId: joi.number().integer().positive().allow(null).optional(),
  doc: joi.string().trim().pattern(digitsOnly, 'Digits only').min(8).allow('').optional(),
  nit: joi.string().trim().allow('').optional(),
  corporation: joi.string().trim().allow('').regex(corporationRegex, 'Alphabetic characters only').optional(),
  direction: joi.string().trim().max(255).required(),
  email: joi.string().trim().email().allow('').optional(),
  cel: joi.string().trim().pattern(/^[0-9]{10}$/, 'Ten digit phone number').required(),
  phone: joi.string().trim().pattern(/^[0-9]{10}$/, 'Ten digit phone number').required(),
  country: joi.number().integer().positive().required(),
  province: joi.number().integer().positive().required(),
  city: joi.number().integer().positive().required(),
  requestTypeId: joi.number().integer().min(1).max(6).required(),
  content: joi.string().trim().max(255).required(),
  dependencyId: joi.number().integer().positive().required(),
  responseChannel: joi.number().integer().min(1).max(2).required(),
  fileUri: joi.string().allow('', null).optional(),
}).custom((value, helpers) => {
  const isJuridica = value.typeSol === 2;
  if (isJuridica) {
    if (!value.nit || value.nit.trim() === "")
      return helpers.message("NIT is required when the applicant is a legal entity (typeSol=2)");
    if (!value.corporation || value.corporation.trim() === "")
      return helpers.message("Razón social (corporation) is required when the applicant is a legal entity (typeSol=2)");
  } else {
    if (!value.documentTypeId)
      return helpers.message("documentTypeId is required when the applicant is not a legal entity");
    if (!value.doc || value.doc.trim() === "")
      return helpers.message("Identification number (doc) is required when the applicant is not a legal entity");
  }
  return value;
});

const vFileSchema = joi.object({
  fieldname: joi.string().required(),
  originalname: joi.string().required(),
  encoding: joi.string().required(),
  mimetype: joi.string().required(),
  size: joi.number().required(),
  buffer: joi.binary().required(),
});

const getListSchema = joi.object({
  number: joi.number().integer().greater(0).default(1),
  size: joi.number().integer().greater(0).max(100).default(10),
  radicado: joi.string().trim().allow('', null).optional(),
  status: joi.string().valid('ENVIADA', 'RECIBIDA', 'ATENDIDA').optional(),
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
  vPqrsPostRegister: async (inputData) => {
    return await use_validator_on_data(postRegisterSchema, inputData);
  },
  vFilePqrs: async (inputData) => {
    return await use_validator_on_data(vFileSchema, inputData);
  },
  vPqrsGetList: async (inputData) => {
    return await use_validator_on_data(getListSchema, inputData);
  },
};