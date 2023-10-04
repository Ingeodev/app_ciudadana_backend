const { StatusCodes } = require("http-status-codes");
const joi = require("joi");


const servicesSchema = joi.object({
  services: joi.array().min(1).items(
      joi.object({
        service: joi.string().trim().empty("").invalid(" ").max(50).required(),
        companyId: joi.number().integer().empty("").greater(0).invalid(0).required(),
      }).unknown(false) // This is to ensure that there are no additional fields in the object.
  )
    .required()
    .custom((value, helpers) => {
      // Ensure that all companyId's are the same
      const firstCompanyId = value[0].companyId;
      for (let i = 1; i < value.length; i++) {
        if (value[i].companyId !== firstCompanyId) {
          return helpers.message("All companyId values must be the same");
        }
      } 
      return value;
    }),
});

const oneServiceSchema = joi.object({
  service: joi.string().trim().empty("").invalid(" ").max(50).required(),
  companyId: joi.number().integer().greater(0).invalid(0).required(),
});

const editSchema = joi.object({
  id: joi.number().integer().empty("").greater(0).invalid(0).required(),
  service: joi.string().trim().empty("").invalid(" ").max(50).required(),
  companyId: joi.number().integer().greater(0).invalid(0).required(),
});

const postDeleteSchema = joi.object({
  id: joi.number().empty("").greater(0).invalid(0).required(),
  companyId: joi.number().integer().greater(0).invalid(0).required(),
});

const postBulkDeleteSchema = joi.object({
  ids: joi.array().items(
    joi.number().integer().greater(0).invalid(0).required()
  ).required(),
  companyId: joi.number().integer().greater(0).invalid(0).required(),

});

const getListAllSchema = joi.object({
  number: joi.number().integer().greater(0).required(),
  size: joi.number().integer().greater(0).required(),
});

const getServicesCompanySchema = joi.object({
  number: joi.number().integer().greater(0).required(),
  size: joi.number().integer().greater(0).required(),
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
  vWebPostServices: async (inputData) => {
    return await use_validator_on_data(servicesSchema, inputData);
  },
  vWebPostOneService: async (inputData) => {
    return await use_validator_on_data(oneServiceSchema, inputData);
  },
  vWebPostEdit: async (inputData) => {
    return await use_validator_on_data(editSchema, inputData);
  },
  vWebPostBulkDelete: async (inputData) => {
    return await use_validator_on_data(postBulkDeleteSchema, inputData);
  },
  vWebPostDelete: async (inputData) => {
    return await use_validator_on_data(postDeleteSchema, inputData);
  },
  vWebGetListAll: async (inputData) => {
    return await use_validator_on_data(getListAllSchema, inputData);
  },
  vWebGetServicesCompany: async (inputData) => {
    return await use_validator_on_data(getServicesCompanySchema, inputData);
  },
};
