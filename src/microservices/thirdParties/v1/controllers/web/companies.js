const { StatusCodes } = require("http-status-codes");
const { Sequelize } = require("sequelize");
const db = require("../../../../../models/index.js");
const validator = require("../../../utils/validators/web/companies.js");
const geocoding = require("../../../../../utils/geocoding.js");
// const geocoding = require("../../../../../utils/geocoding_vNodeGeocoder.js");
// {  lat: 2.4883636,  lng: -76.56589699999999,  type: null,  address: 'Cl. 70 Nte. #17-17, Popayán, Cauca, Colombia' }

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
      thirdPartyCategoryId: categoryId,
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
    const { address } = await validator.vWebPostGeocoding(req.body);
    const geocode = await geocoding.getGeocoding(address);

    if (geocode.status) {
      throw {
        status: geocode.status,
        message: geocode.detail,
      };
    }

    return res.status(StatusCodes.OK).json({ meta: null, data: geocode });
  } catch (error) {
    // console.error("The address could not be geocoded: ", error.message);
    return next(error);
  }
};

/**
 * Update a company
 * @param {object} req - Object containing the id, name, icon, iconMap, color
 * @return {object} Response contains: statuscode (integer), json (category object updated) if 200OK. Or if there's error, json (object): status, code, detail
 */
exports.postEdit = async (req, res, next) => {
  try {
    const { id, name, icon, iconMap, color } = await validator.vWebPostEdit(
      req.body
    );

    const dataQuery = {
      id,
      name,
      icon,
      iconMap,
      color,
    };

    const categoryInDb = await db.ThirdPartyCategory.findByPk(id);

    if (categoryInDb === null) {
      throw {
        status: StatusCodes.NOT_FOUND,
        message: `company does not exist`,
      };
    }

    const resultUpdate = await categoryInDb.update(dataQuery);

    return res.status(StatusCodes.OK).json({
      meta: null,
      data: resultUpdate,
    });
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
    const { id } = await validator.vWebGetOneById({
      id: parseInt(req.params.id),
    });

    const categInDb = await db.ThirdPartyCategory.findByPk(id);

    if (categInDb === null) {
      throw {
        status: StatusCodes.NOT_FOUND,
        message: "Third-party category information could not be retrieved",
      };
    }

    return res.status(StatusCodes.OK).send({ meta: null, data: categInDb });
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
    const { id } = await validator.vWebPostDelete(req.body);
    const categInDb = await db.ThirdPartyCompany.findOne({
      where: { id },
    });

    if (categInDb === null) {
      throw {
        status: StatusCodes.NOT_FOUND,
        message: `Third-party category does not exist`,
      };
    }

    // ! Pendiente: Verificar que la categoria no este siendo usada en otras tablas

    await categInDb.destroy();

    return res.status(StatusCodes.OK).json({
      meta: null,
      data: { id },
    });
  } catch (error) {
    // console.error("ThirdParty categories could not be deleted: ", error.message);
    return next(error);
  }
};
