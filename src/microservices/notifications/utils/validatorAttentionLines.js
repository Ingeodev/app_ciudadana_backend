const { StatusCodes } = require("http-status-codes");
const joi = require("joi");

// * ------------------ Attention Lines -----------------
const attentionLPostRegisterchema = joi.object({
  name: joi.string().required().trim().empty("").invalid(" "),
  phone: joi.string().required().trim().empty("").invalid(" "),
  imageUri: joi.string().uri().required().trim().empty("").invalid(" "),
  imageSiteUri: joi.string().uri().required().trim().empty("").invalid(" "),
  whatsapp: joi.string().required().trim().empty("").invalid(" "),
  url: joi.string().uri().required().trim().empty("").invalid(" "),
});

const attentionLPostUpdatechema = joi.object({
  id: joi.number().empty("").invalid(0),
  name: joi.string().trim().empty("").invalid(" "),
  phone: joi.string().trim().empty("").invalid(" "),
  imageUri: joi.string().uri().trim().empty("").invalid(" "),
  imageSiteUri: joi.string().uri().trim().empty("").invalid(" "),
  whatsapp: joi.string().trim().empty("").invalid(" "),
  url: joi.string().uri().trim().empty("").invalid(" "),
});

const getAttentionLListAllSchema = joi.object({
  page: joi.number().invalid(0),
  pageSize: joi.number().invalid(0),
});

const getAttentionLGetOneSchema = joi.object({
  id: joi.number().required().empty("").invalid(0),
});

const postAttentionLUpdateActiveSchema = joi.object({
  id: joi.number().required().empty("").invalid(0),
  active: joi.boolean().required(),
});
// * ------------------ END - Attention Lines -----------------


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
  // * ------------------ Attention Lines -----------------
  vAttentionLPostRegister: async (inputData) => {
    return await use_validator_on_data(attentionLPostRegisterchema, inputData);
  },
  vAttentionLPostUpdate: async (inputData) => {
    return await use_validator_on_data(attentionLPostUpdatechema, inputData);
  },
  vAttentionLGetListAll: async (inputData) => {
    return await use_validator_on_data(getAttentionLListAllSchema, inputData);
  },
  vAttentionLGetOne: async (inputData) => {
    return await use_validator_on_data(getAttentionLGetOneSchema, inputData);
  },
  vPostAttentionLUpdateActive: async (inputData) => {
    return await use_validator_on_data(
      postAttentionLUpdateActiveSchema,
      inputData
    );
  },
  // * ------------------ END - Attention Lines -----------------
};
