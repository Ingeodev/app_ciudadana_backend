const { StatusCodes } = require('http-status-codes');
const { Sequelize } = require("sequelize");
const db = require('../../../../models');
const validator = require('../../utils/validatorGenderAttentionPoint');

/**
 * Create an attention point of gender equity 
 * @param {object} req - Object containing the name, description, imageUri, phone, color, address, iconMap, lat, lon
 * @return {object} Response contains: statuscode (integer), json (objeto): echo reply, if 200OK. Or if there's error, json (objeto): status, code, detail
 */
const postRegister = async (req, res, next) => {
  try {
    const { name, description, imageUri, phone, color, address, iconMap, lat, lon } =
      await validator.vWebPostRegister(req.body);
    const webUser = await db.User.findOne({
      where: { disabled: false, userMobile: false, clientId: res.locals.uid },
      attributes: ["id"],
    });
    if (webUser == null || webUser.id == null)
      throw {
        message: "Requesting user is not allowed to create Gender Attention Points.",
        status: StatusCodes.FORBIDDEN,
      };

    const createdSAP = await db.GenderAttentionPoint.create({
      name,
      description,
      imageUri,
      phone: `+57${phone}`,
      color,
      address,
      iconMap,
      geolocation: Sequelize.literal(`ST_GeomFromText('POINT(${lon} ${lat})')`),
      createdBy: webUser.id,
    });
    const data = {
      ...createdSAP.dataValues,
      deletedAt: undefined,
      geolocation: undefined,
      createdBy: undefined,
      lat: createdSAP.dataValues.geolocation.coordinates[1],
      lon: createdSAP.dataValues.geolocation.coordinates[0],
    };
    return res.status(StatusCodes.CREATED).json({ meta: null, data });
  } catch (error) {
    return next(error);
  }
};

/**
 * Update an attention point of gender equity
 * @param {object} req - Object containing the id, name, description, imageUri, phone, color, address, iconMap, lat, lon
 * @return {object} Response contains: statuscode (integer), json (objeto): echo reply, if 200OK. Or if there's error, json (objeto): status, code, detail
 */
const postEdit = async (req, res, next) => {
  try {
    const update = await validator.vWebPostUpdate(req.body);
    const existingPoint = await db.GenderAttentionPoint.findByPk(update.id);
    let lat = undefined;
    let lon = undefined;
    if (existingPoint == null)
      throw {
        status: StatusCodes.NOT_FOUND,
        message: `Attention point of gender equity not found`,
      };
    delete update.id;
    if (update.lat != null) {
      update.geolocation = Sequelize.literal(`ST_GeomFromText('POINT(${update.lon} ${update.lat})')`);
      lat = update.lat;
      lon = update.lon;
      delete update.lat;
      delete update.lon;
    }
    if (!isNaN(update.phone)) {
      update.phone = `+57${update.phone}`;
    }

    const updatedPoint = await existingPoint.update(update);

    const data = {
      ...updatedPoint.dataValues,
      deletedAt: undefined,
      geolocation: undefined,
      createdBy: undefined,
      lat,
      lon,
    };
    return res.status(StatusCodes.OK).json({
      data,
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * Destroy (Soft delete) an attention point of gender equity
 * @param {integer} req.body.id - id of attention point of gender equity
 * @return {object} Response contains: statuscode (integer), json (objeto): data attention point. Or if there's error, json (objeto): status, code, detail
 */
const postDelete = async (req, res, next) => {
  try {
    const { id } = await validator.vWebPostDelete(req.body);
    const existingPoint = await db.GenderAttentionPoint.findByPk(id);
    if (existingPoint == null)
      throw {
        status: StatusCodes.NOT_FOUND,
        message: `The requested Gender Attention Point has already been deleted.`,
      };
    await existingPoint.destroy();
    return res.status(StatusCodes.OK).json({
      data: { id },
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * Retrieve only one gender attention point by ID
 * @param {integer} req.params.id - id of attention point of gender equity
 * @return {object} Response contains: statuscode (integer), json (objeto): data attention point. Or if there's error, json (objeto): status, code, detail
 */
const getOneGenderAttentionPoint = async (req, res, next) => {
  try {
    const { id } = await validator.vWebGetOne(req.params);
    const existingPoint = await db.GenderAttentionPoint.findByPk(id);
    if (existingPoint == null)
      throw {
        status: StatusCodes.NOT_FOUND,
        message: `The requested gender Attention Point does not exist.`
      };
    const data = {
      ...existingPoint.dataValues,
      deletedAt: undefined,
      geolocation: undefined,
      createdBy: undefined,
      lat: existingPoint.dataValues.geolocation.coordinates[1],
      lon: existingPoint.dataValues.geolocation.coordinates[0],
    };
    return res.status(StatusCodes.OK)
      .json({
        data,
      });
  } catch (error) {
    return next(error);
  }
};

/**
 * Get all attention points of gender equity
 * @param {object} req.query - Object containing the number and size
 * @return {object} Response contains: statuscode (integer), json (objeto): data attention points. Or if there's error, json (objeto): status, code, detail
 */
const getListAll = async (req, res, next) => {
  try {
    const pagination = await validator.vWebGetListAll({
      number: req.query.page ? parseInt(req.query.page.number) : null,
      size: req.query.page ? parseInt(req.query.page.size) : null,
    });
    const offset = (pagination.number - 1) * pagination.size;
    const pagePoints = await db.GenderAttentionPoint.findAndCountAll({
      unique: true,
      paranoid: true,
      order: [["createdAt", "DESC"]],
      offset,
      limit: pagination.size,
      attributes: {
        exclude: ["createdBy", "deletedAt"],
      },
    });
    let message = undefined;
    if (pagePoints.count <= 0)
      message = 'There are no Gender Attention Points registered in the database.';
    if (pagePoints.rows.length <= 0)
      message = '"page[number]" is too large for the number of possible pages.';

    const data = pagePoints.rows.map((row) => {
      return {
        ...row.dataValues,
        deletedAt: undefined,
        geolocation: undefined,
        createdBy: undefined,
        lat: row.dataValues.geolocation.coordinates[1],
        lon: row.dataValues.geolocation.coordinates[0],
      };
    });
    return res.status(StatusCodes.OK).json({
      meta: {
        message,
        page: pagination.number,
        pageSize: pagination.size,
        totalRecords: pagePoints.count,
        totalPages: Math.ceil(pagePoints.count / pagination.size),
      },
      data,
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  postRegister,
  postEdit,
  postDelete,
  getListAll,
};