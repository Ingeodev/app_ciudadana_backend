const { StatusCodes } = require("http-status-codes");
const joi = require("joi");

// const uri_string = joi.string().uri({ allowRelative: true });
// const integer_number = joi.number().integer();

const registerSchema = joi.object({
  city: joi.string().trim().empty("").invalid(" ").max(100).required(),
  cityCode: joi.number().integer().empty("").greater(0).invalid(0).required(),
  // cityCode: joi.string().trim().empty("").invalid(" ").max(50).required(),
  state: joi.string().trim().empty("").invalid(" ").max(100).required(),
});

const editSchema = joi.object({
  id: joi.number().integer().empty("").greater(0).invalid(0).required(),
  city: joi.string().trim().empty("").invalid(" ").max(100),
  cityCode: joi.number().integer().empty("").greater(0).invalid(0),
  // cityCode: joi.string().trim().empty("").invalid(" ").max(50),
  state: joi.string().trim().empty("").invalid(" ").max(100),
});

const getAllSchema = joi.object({
  number: joi.number().integer().greater(0).required(),
  size: joi.number().integer().greater(0).required(),
});

const getAutocSchema = joi.object({
  q: joi.string().trim().empty("").invalid(" ").max(20).required(),
  number: joi.number().integer().greater(0).required(),
  size: joi.number().integer().greater(0).required(),
});

const getOneSchema = joi.object({
  id: joi.number().empty("").greater(0).invalid(0).required(),
});

const postDeleteSchema = joi.object({
  id: joi.number().empty("").greater(0).invalid(0).required(),
});

// ---------- Excel - Start -----------------------
const multerMemorySingleItemSchema = joi.object({
  fieldname: joi.string().required(),
  originalname: joi.string().required(),
  encoding: joi.string().required(),
  mimetype: joi.string().required(),
  size: joi.number().required(),
  buffer: joi.binary().required(),
}).required().error(new Error('A valid file is required.'));

const numPage = 1;
const numCol = 3;
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
    })
  );

const excelHeaderSchema = joi.object({
  header: joi.array().items(joi.string()).required(),
});


const excelCitySchema = joi.object({
  city: joi.string().trim().empty("").invalid(" ").max(100).required(),
  cityCode: joi.number().integer().empty("").greater(0).invalid(0).required(),
  state: joi.string().trim().empty("").invalid(" ").max(100).required(),
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
  vWebGetAll: async (inputData) => {
    return await use_validator_on_data(getAllSchema, inputData);
  },
  vWebGetAutocomplete: async (inputData) => {
    return await use_validator_on_data(getAutocSchema, inputData);
  },
  vWebGetOneById: async (inputData) => {
    return await use_validator_on_data(getOneSchema, inputData);
  },
  vWebPostDelete: async (inputData) => {
    return await use_validator_on_data(postDeleteSchema, inputData);
  },
  // Start - XLS - Upload
  vMulterMemorySingleItemSchema: async (inputData) => {
    return await use_validator_on_data(multerMemorySingleItemSchema, inputData);
  },
  vExcelHeaderSchema: async (inputData) => {
    return await use_validator_on_data(excelHeaderSchema, inputData);
  },
  vExcelCitySchema: async (inputData) => {
    return await use_validator_on_data(excelCitySchema, inputData);
  },
  vExcelPagesSchema: async (inputData) => {
    return await use_validator_on_data(excelPagesSchema, inputData);
  },
};
