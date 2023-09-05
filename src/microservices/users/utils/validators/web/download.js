const { StatusCodes } = require('http-status-codes');
const joi = require('joi');

const not_path_string = joi.string().trim().regex(/([\\/#?!%*:|"'`<>{}=&$+@])+|(\.\.)+/, { invert: true, name: 'Path-like string' });

const downloadSchema = joi.object({
    folder: not_path_string.required(),
    fileName: not_path_string.required(),
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
    validateDownloadSchema: async inputData => {
        return await use_validator_on_data(downloadSchema, inputData);
    },
};