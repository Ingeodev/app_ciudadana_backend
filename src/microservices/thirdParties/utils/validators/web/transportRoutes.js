const { StatusCodes } = require("http-status-codes");
const joi = require("joi");

const routesSchema = joi.object({
  origin: joi.number().integer().greater(0).invalid(0).required(),
  destination: joi.number().integer().greater(0).invalid(0).required(),
  companyId: joi.number().integer().greater(0).invalid(0).required(),
});

const editSchema = joi.object({
  id: joi.number().integer().empty("").greater(0).invalid(0).required(),
  origin: joi.number().integer().greater(0).invalid(0),
  destination: joi.number().integer().greater(0).invalid(0),
  companyId: joi.number().integer().greater(0).invalid(0).required(),
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

const routesExcelContentsSchema = joi.array().length(1).items(joi.object({
  name: joi.string(),
  data: joi.array().min(2).items(joi.array().length(2).items(
    joi.alternatives([joi.number().integer().min(0), joi.string().max(200)])
  )),
}));

const routeSchema = joi.object({
  id: joi.number().integer().min(0).required(),
  origin: joi.string().max(200).required(),
  destination: joi.string().max(200).required(),
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
  vRoutesExcelContentsSchema: async (inputData) => {
    return await use_validator_on_data(routesExcelContentsSchema, inputData);
  },
  vRouteSchema: async (inputData) => {
    return await use_validator_on_data(routeSchema, inputData);
  },
  // End - XLS - Upload
};
