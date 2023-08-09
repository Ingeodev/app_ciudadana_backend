const { StatusCodes } = require("http-status-codes");
const joi = require("joi");
const { use_validator_on_data} = require("../../../utils/validator")

const roleDataSchema = joi.object({
  name: joi.string().required()
});

const roleCreationSchema = joi.object({
  data: roleDataSchema.required(),
});

const validateRoleCreation = async (inputData) => {
  return await use_validator_on_data(roleCreationSchema, inputData);
}

module.exports = {
  validateRoleCreation
};
