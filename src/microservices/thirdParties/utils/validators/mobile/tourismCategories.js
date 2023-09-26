const { StatusCodes } = require("http-status-codes");
const joi = require("joi");

const integer_number = joi.number().integer();
const positive_integer = integer_number.positive();

const page_object = joi.object({
    size: positive_integer.label('page[size]').required(),
    number: positive_integer.label('page[number]').required(),
});

const optionalPaginationSchema = joi.object({
    page: page_object,
});

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
    validateOptionalPaginationSchema: async (inputData) => {
        return await use_validator_on_data(optionalPaginationSchema, inputData);
    },
};
