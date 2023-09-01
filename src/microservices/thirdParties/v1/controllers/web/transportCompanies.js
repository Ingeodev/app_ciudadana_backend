const { StatusCodes } = require("http-status-codes");
const { Sequelize } = require("sequelize");
const db = require("../../../../../models/index.js");
const validator = require("../../../utils/validators/web/transportCompanies.js");

/**
 * Create a transport company
 * @param {object} req - Object containing the name, description, address, imageUri, lat, lon
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

    const { name, description, address, imageUri, lat, lon } =
      await validator.vWebPostRegister(req.body);

    const dataQuery = {
      createdBy: createdBy.id,
      name,
      description,
      address,
      imageUri,
      lat,
      lon,
      geolocation: Sequelize.literal(`ST_GeomFromText('POINT(${lon} ${lat})')`),
    };

    const result = await db.TransportCompany.create(dataQuery);
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
 * Update a transport company
 * @param {object} req - Object containing the id, name, description, address, imageUri, lat, lon
 * @return {object} Response contains: statuscode (integer), json (transport company object updated) if 200OK. Or if there's error, json (object): status, code, detail
 */
exports.postEdit = async (req, res, next) => {
  try {
    // // ! Pendiente: Validar permisos del usuario
    // const createdBy = await db.User.findOne({
    //   where: { disabled: false, userMobile: false, clientId: res.locals.uid },
    //   attributes: ["id"],
    // });

    // if (createdBy == null || createdBy.id == null)
    //   throw {
    //     message: "User not found",
    //     status: StatusCodes.NOT_FOUND,
    //   };

    const {
      id,
      name,
      description,
      address,
      imageUri,
      lat,
      lon,
    } = await validator.vWebPostEdit(req.body);

    const dataQuery = {
      id,
      name,
      description,
      address,
      imageUri,
      lat,
      lon,
      // ! Decirle al front que siempre envie el par alt, lon
      geolocation: Sequelize.literal(`ST_GeomFromText('POINT(${lon} ${lat})')`),
    };

    // Validate that the company belongs to the user
    const companyInDb = await db.TransportCompany.findOne({
      where: {
        id,
        // // ! Pendiente: Validar permisos del usuario
        // createdBy: createdBy.id,
      },
    });

    if (companyInDb == null)
      throw {
        message: "Transport company not found",
        status: StatusCodes.NOT_FOUND,
        // status: StatusCodes.UNPROCESSABLE_ENTITY,
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
 * Get the data of transport company - profile 
 * @return {object} Response contains: statuscode (integer), json (object): transport company data. Or if there's error, json (object): status, code, detail
 */
exports.getProfile = async (req, res, next) => {
  try {
    // // ! Pendiente: Validar permisos del usuario
    // const createdBy = await db.User.findOne({
    //   where: { disabled: false, userMobile: false, clientId: res.locals.uid },
    //   attributes: ["id"],
    // });

    // if (createdBy == null || createdBy.id == null)
    //   throw {
    //     message: "User not found",
    //     status: StatusCodes.NOT_FOUND,
    //   };

    const { id } = await validator.vWebGetProfile({
      id: parseInt(req.params.id),
    });

    // Validate that the company belongs to the user
    const companyInDb = await db.TransportCompany.findOne({
      where: {
        id,
        // // ! Pendiente: Validar permisos del usuario
        // createdBy: createdBy.id,
      },
      attributes: {
        exclude: ["createdBy", "geolocation", "deletedAt"],
      },
    });

    if (companyInDb == null)
      throw {
        message: "Transport company could not be retrieved",
        status: StatusCodes.NOT_FOUND,
        // status: StatusCodes.UNPROCESSABLE_ENTITY,
      };

    

    // const companyInDb = await db.ThirdPartyCategory.findByPk(id);
    delete companyInDb.dataValues.createdBy;
    // ! Front necesita la variable de geolocation??
    delete companyInDb.dataValues.geolocation;
    delete companyInDb.dataValues.deletedAt;

    return res.status(StatusCodes.OK).send({
      meta: null,
      data: companyInDb,
    });
  } catch (error) {
    // console.error("company could not be recovered: ", error.message);
    return next(error);
  }
};

/**
 * Destroy a transport company (soft delete)
 * @return {object} Response contains: statuscode (integer), json (object): id. Or if there's error, json (object): status, code, detail
 */
exports.postDelete = async (req, res, next) => {
  try {
    // // ! Pendiente: Validar permisos del usuario
    // const createdBy = await db.User.findOne({
    //   where: { disabled: false, userMobile: false, clientId: res.locals.uid },
    //   attributes: ["id"],
    // });

    // if (createdBy == null || createdBy.id == null)
    //   throw {
    //     message: "User not found",
    //     status: StatusCodes.NOT_FOUND,
    //   };
    
    const { id } = await validator.vWebPostDelete(req.body);
    const companyInDb = await db.TransportCompany.findOne({
      where: {
        id,
        // // ! Pendiente: Validar permisos del usuario
        // createdBy: createdBy.id,
      },
    });

    if (companyInDb === null) {
      throw {
        status: StatusCodes.NOT_FOUND,
        message: `Transport company does not found`,
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
