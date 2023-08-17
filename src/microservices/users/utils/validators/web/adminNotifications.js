const { StatusCodes } = require("http-status-codes");
const joi = require("joi");

// const uri_string = joi.string().uri();
// const integer_number = joi.number().integer();

const postAccountInfoSchema = joi.object({
  name: joi.string().trim().required().empty("").invalid(" "),
  lastName: joi.string().trim().required().empty("").invalid(" "),
  phone: joi.string().trim().required().empty("").invalid(" "),
  // ! HU-B1 Monday - Solo el email es requerido?. Requerido en la db o para la solicitud HTTP?
  email: joi.string().trim().email().required().empty("").invalid(" "),
});

const postAccountFullLoginSchema = joi.object({
  documentTypeId: joi.number().integer().greater(0).required(),
  document: joi.string().trim().required().empty("").invalid(" "),
  address: joi.string().trim().required().empty("").invalid(" "),
  serviceReceiptUri: joi.string().uri().required().trim().empty("").invalid(" "),
});

const postAccountUpdateUserSchema = joi.object({
  name: joi.string().trim().empty("").invalid(" "),
  lastName: joi.string().trim().empty("").invalid(" "),
  phone: joi.string().trim().empty("").invalid(" "),
  address: joi.string().trim().empty("").invalid(" "),
});

// * ------------- App Web --------------------------------
const getAdminNotifSchema = joi.object({
  number: joi.number().integer().greater(0).required(),
  size: joi.number().integer().greater(0).required(),
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
  vGetAllNotif: async (inputData) => {
    return await use_validator_on_data(getAdminNotifSchema, inputData);
  },
};
