const { StatusCodes } = require("http-status-codes");
const joi = require("joi");

const colombian_car_plate_regex = /^[A-Z]{3}[0-9]{3}$/;

const colombian_car_plate = joi.string().uppercase().trim().regex(colombian_car_plate_regex, 'Colombian Car Plate');
const numeric_string = joi.string().trim().regex(/^[0-9]*$/, 'Numeric String');

const taxiQuerySchema = joi.object({
    q: [colombian_car_plate.required(), numeric_string.required()],
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
    getColombianCarPlateRegex: () => colombian_car_plate_regex,
    validateTaxiQuerySchema: async (inputData) => {
        return await use_validator_on_data(taxiQuerySchema, inputData);
    },
}