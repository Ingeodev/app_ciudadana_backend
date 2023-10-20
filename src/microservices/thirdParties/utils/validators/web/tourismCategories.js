const { StatusCodes } = require("http-status-codes");
const joi = require("joi");

const name_str = joi.string().trim().regex(/^[a-zA-ZñÑáéíóúÁÉÍÓÚüÜ\s0-9]+$/, 'Spanish Name String').max(50);
const hex_color_string = joi.string().trim().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Hexadecimal Color Code');
const uri_string = joi.string().uri({ allowRelative: true });
const integer_number = joi.number().integer();
const non_negative_integer = integer_number.min(0);
const positive_integer = integer_number.positive();

const page_object = joi.object({
    size: positive_integer.label('page[size]').required(),
    number: positive_integer.label('page[number]').required(),
});

const simplePaginationSchema = joi.object({
    page: page_object.required(),
});

const createTourCatSchema = joi.object({
    name: name_str.required(),
    color: hex_color_string.required(),
    icon: uri_string,
    iconMap: uri_string,
});

const editTourCatSchema = joi.object({
    id: non_negative_integer.required(),
    name: name_str,
    color: hex_color_string,
    icon: uri_string,
    iconMap: uri_string,
}).or('name', 'color', 'icon', 'iconMap');

const simpleDeleteByIdSchema = joi.object({
    id: non_negative_integer.required()
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
    validateSimplePaginationSchema: async (inputData) => {
        return await use_validator_on_data(simplePaginationSchema, inputData);
    },
    validateCreateTourCatSchema: async (inputData) => {
        return await use_validator_on_data(createTourCatSchema, inputData);
    },
    validateEditTourCatSchema: async (inputData) => {
        return await use_validator_on_data(editTourCatSchema, inputData);
    },
    validateSimpleDeleteByIdSchema: async (inputData) => {
        return await use_validator_on_data(simpleDeleteByIdSchema, inputData);
    },
};