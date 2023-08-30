const { StatusCodes } = require("http-status-codes");
const { Sequelize } = require("sequelize");
const db = require("../../../../../models/index.js");
const validator = require("../../../utils/validators/web/companies.js");
// const geocoding = require("../../../../../utils/geocoding.js");

/**
 * Create a company
 * @param {object} req - Object containing the name, nit, categoryId, description, phone, siteUri, address, imageUri, lat, lon
 * @return {object} Response contains: statuscode (integer), json (object): echo reply, if 200OK. Or if there's error, json (object): status, code, detail
 */
exports.postRegister = async (req, res, next) => {
  try {
    // ! Pendiente: Validar permisos del usuario
    const createdBy = await db.User.findOne({
      where: { disabled: false, userMobile: false, clientId: res.locals.uid },
      attributes: ["id"],
    });

    if (createdBy == null || createdBy.id == null)
      throw {
        message: "User not found.",
        status: StatusCodes.NOT_FOUND,
      };

    const { name, nit, categoryId, description, phone, siteUri, address, imageUri, lat, lon } =
      await validator.vWebPostRegister(req.body);

    const dataQuery = {
      createdBy: createdBy.id,
      name,
      nit,
      categoryId,
      description,
      phone,
      siteUri,
      address,
      imageUri,
      lat,
      lon,
      geolocation: Sequelize.literal(`ST_GeomFromText('POINT(${lon} ${lat})')`),
    };

    const result = await db.ThirdPartyCompany.create(dataQuery);
    delete result.dataValues.createdBy;
    // ! Front necesita la variable de geolocation?? 
    delete result.dataValues.geolocation;
    delete result.dataValues.deletedAt;
    return res.status(StatusCodes.CREATED).json({ meta: null, data: result });
  } catch (error) {
    // console.error("company could not be created: ", error.message);
    return next(error);
  }
};

/**
 * Obtain the coordinates (latitude and longitude) of a street address.
 * @param {object} req - Object containing the address (string)
 * @return {object} Response contains: statuscode (integer), json (object): latitude (lat), longitude (lon), type, and address, if 200OK. Or if there's error, json (object): status, code, detail
 */
exports.postGeocoding = async (req, res, next) => {
  try {
    return res
      .status(StatusCodes.OK)
      .json({ meta: null, data: "Endpoint under construction" });
    const { address } = await validator.vWebPostGeocoding(req.body);
    // const geocode = await geocoding.getGeocodingGoogle(address);
    // const geocode = await geocoding.getGeocodingHere(address);
    // const geocode = await geocoding.getGeocodingMapbox(address);

    if (geocode.status) {
      throw {
        status: geocode.status,
        message: geocode.detail,
      };
    }

    return res
      .status(StatusCodes.OK)
      .json({ meta: { length: geocode.length }, data: geocode });
  } catch (error) {
    // console.error("The address could not be geocoded: ", error.message);
    return next(error);
  }
};

/**
 * Update a company
 * @param {object} req - Object containing the id, name, nit, categoryId, description, phone, siteUri, address, imageUri, lat, lon
 * @return {object} Response contains: statuscode (integer), json (category object updated) if 200OK. Or if there's error, json (object): status, code, detail
 */
exports.postEdit = async (req, res, next) => {
  try {
    // ! Pendiente: Validar permisos del usuario
    const createdBy = await db.User.findOne({
      where: { disabled: false, userMobile: false, clientId: res.locals.uid },
      attributes: ["id"],
    });

    if (createdBy == null || createdBy.id == null)
      throw {
        message: "User not found",
        status: StatusCodes.NOT_FOUND,
      };

    const {
      id,
      name,
      nit,
      categoryId,
      description,
      phone,
      siteUri,
      address,
      imageUri,
      lat,
      lon,
    } = await validator.vWebPostEdit(req.body);

    const dataQuery = {
      id,
      name,
      nit,
      categoryId,
      description,
      phone,
      siteUri,
      address,
      imageUri,
      lat,
      lon,
      // ! Decirle al front que siempre envie el par alt, lon
      geolocation: Sequelize.literal(`ST_GeomFromText('POINT(${lon} ${lat})')`),
    };

    // Validate that the company belongs to the user
    const companyInDb = await db.ThirdPartyCompany.findOne({
      where: {
        id,
        // ! Pendiente: Validar permisos del usuario
        createdBy: createdBy.id,
      },
    });

    if (companyInDb == null)
      throw {
        message: "Company editing failure",
        status: StatusCodes.UNPROCESSABLE_ENTITY,
      };

    // const companyInDb = await db.ThirdPartyCategory.findByPk(id);

    const resultUpdate = await companyInDb.update(dataQuery);
    delete resultUpdate.dataValues.createdBy;
    // ! Front necesita la variable de geolocation??
    delete resultUpdate.dataValues.geolocation;
    delete resultUpdate.dataValues.deletedAt;

    return res.status(StatusCodes.OK).json({ meta: null, data: resultUpdate });
  } catch (error) {
    // console.error("ThirdParty categories could not be updated: ", error.message);
    if (
      error &&
      error.errors &&
      error.errors.length > 0 &&
      error.errors[0].message
    ) {
      error.message = error.errors[0].message;
    }
    return next(error);
  }
};

/**
 * Get the data of company and your services - to profile 
 * @return {object} Response contains: statuscode (integer), json (object): data ThirdParty categories. Or if there's error, json (object): status, code, detail
 */
exports.getProfile = async (req, res, next) => {
  try {
    // ! Pendiente: Validar permisos del usuario
    const createdBy = await db.User.findOne({
      where: { disabled: false, userMobile: false, clientId: res.locals.uid },
      attributes: ["id"],
    });

    if (createdBy == null || createdBy.id == null)
      throw {
        message: "User not found",
        status: StatusCodes.NOT_FOUND,
      };

    const { id } = await validator.vWebGetProfile({
      id: parseInt(req.params.id),
    });

    // Validate that the company belongs to the user
    const companyInDb = await db.ThirdPartyCompany.findOne({
      where: {
        id,
        // ! Pendiente: Validar permisos del usuario
        createdBy: createdBy.id,
      },
    });

    if (companyInDb == null)
      throw {
        message: "Company could not be retrieved",
        status: StatusCodes.UNPROCESSABLE_ENTITY,
      };

    // Get company services
    const servicesInDb = await db.ThirdPartyService.findAndCountAll({
      where: {
        companyId: companyInDb.id,
      },
      attributes: ["id", "service", "companyId", "createdAt", "updatedAt"],
    });

    // const companyInDb = await db.ThirdPartyCategory.findByPk(id);
    delete companyInDb.dataValues.createdBy;
    // ! Front necesita la variable de geolocation??
    delete companyInDb.dataValues.geolocation;
    delete companyInDb.dataValues.deletedAt;

    return res.status(StatusCodes.OK).send({
      meta: null,
      data: {
        company: companyInDb,
        services: servicesInDb.rows,
      },
    });
  } catch (error) {
    // console.error("company could not be recovered: ", error.message);
    return next(error);
  }
};

/**
 * Destroy a company (soft delete)
 * @return {object} Response contains: statuscode (integer), json (object): id. Or if there's error, json (object): status, code, detail
 */
exports.postDelete = async (req, res, next) => {
  try {
    // ! Pendiente: Validar permisos del usuario
    const createdBy = await db.User.findOne({
      where: { disabled: false, userMobile: false, clientId: res.locals.uid },
      attributes: ["id"],
    });

    if (createdBy == null || createdBy.id == null)
      throw {
        message: "User not found",
        status: StatusCodes.NOT_FOUND,
      };
    
    const { id } = await validator.vWebPostDelete(req.body);
    const companyInDb = await db.ThirdPartyCompany.findOne({
      where: {
        id,
        // ! Pendiente: Validar permisos del usuario
        createdBy: createdBy.id,
      },
    });

    if (companyInDb === null) {
      throw {
        status: StatusCodes.NOT_FOUND,
        message: `Company does not exist`,
      };
    }

    await companyInDb.destroy();

    return res.status(StatusCodes.OK).json({
      meta: null,
      data: { id },
    });
  } catch (error) {
    // console.error("ThirdParty categories could not be deleted: ", error.message);
    return next(error);
  }
};
