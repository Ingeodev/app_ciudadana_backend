const { StatusCodes } = require("http-status-codes");
const joi = require("joi");
const { Op } = require("sequelize");
const db = require("../models/index.js");
const { onlyDateWithOffset } = require("../utils/utcZone.js");

const apiKeySchema = joi
  .object({
    apiKey: joi.string().trim().empty("").invalid(" ").required().error((errors) => {
      errors.forEach((err) => {
        // const label = err.local?.label || "value";
        switch (err.code) {
          default:
            err.message = `Missing header x-api-key`;
            break;
        }
      });
      return errors;
    }),
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
    error.status = StatusCodes.UNAUTHORIZED;
    return Promise.reject(error);
  }
};


const authMiddleware = async (req, res, next) => {
  try {
    const { apiKey } = await use_validator_on_data(apiKeySchema, {
      apiKey: req.headers["x-api-key"],
    });

    const apiInDb = await db.UserApiKey.findOne({
      where: {
        key: apiKey,
        expirationAt: { [Op.gte]: onlyDateWithOffset() },
      },
      paranoid: true,
    });

    if (apiInDb == null)
      throw {
        message: "x-api-key not valid",
        status: StatusCodes.UNAUTHORIZED,
      };

    // Verify that the company is not deleted
    let categoryExists = null;
    if (!isNaN(apiInDb.tourismCompanyId)) {
      categoryExists = await db.TourismCompany.findByPk(
        apiInDb.tourismCompanyId,
        { attributes: ["id"], paranoid: true }
      );
    }

    if (!isNaN(apiInDb.transportCompanyId)) {
      categoryExists = await db.TransportCompany.findByPk(
        apiInDb.transportCompanyId,
        { attributes: ["id"], paranoid: true }
      );
    }

    if (categoryExists === null)
      throw {
        message: "Company not found.",
        status: StatusCodes.UNAUTHORIZED,
      };

    res.locals = {
      ...res.locals,
      apiCreatedBy: apiInDb.createdBy,
      apiTourismCompanyId: apiInDb.tourismCompanyId,
      apiTransportCompanyId: apiInDb.transportCompanyId,
    };
    return next();
  } catch (error) {
    if (error.code)
      error.status = StatusCodes.UNAUTHORIZED;
    return next(error);
  }
};

const validateModuleTourism = async (req, res, next) => {
  try {
    if (
      !isNaN(res.locals.apiTourismCompanyId) &&
      res.locals.apiTransportCompanyId === null
    ) {
      return next();
    }
    throw {
      message: "x-api-key not valid",
      status: StatusCodes.UNAUTHORIZED,
    };
  } catch (error) {
    if (error.code) error.status = StatusCodes.UNAUTHORIZED;
    return next(error);
  }
};

const validateModuleTransportRoutes = async (req, res, next) => {
  try {
    if (
      !isNaN(res.locals.apiTransportCompanyId) &&
      res.locals.apiTourismCompanyId === null
    ) {
      return next();
    }
    throw {
      message: "x-api-key not valid",
      status: StatusCodes.UNAUTHORIZED,
    };
  } catch (error) {
    if (error.code) error.status = StatusCodes.UNAUTHORIZED;
    return next(error);
  }
};

module.exports = {
  authMiddleware,
  validateModuleTourism,
  validateModuleTransportRoutes,
};