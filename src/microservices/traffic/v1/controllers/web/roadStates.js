const { StatusCodes } = require("http-status-codes");
const db = require("../../../../../models/index.js");
const validator = require("../../../utils/validators/web/roadStates.js");

/**
 * Create a road state
 * @param {object} req - Object containing the title, description, startDate, endDate, iconMap, recurrence, typeCoordinates, coordinates
 * @return {object} Response contains: statusCode (integer), json (object): echo reply, if 200OK. Or if there's error, json (object): status, code, detail
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

    const {
      title,
      description,
      startDate,
      endDate,
      iconMap,
      recurrence,
      typeCoordinates,
      coordinates,
      color
    } = await validator.vWebPostRegister(req.body);

    const date1 = new Date(startDate);
    const date2 = new Date(endDate);
    
    const result = await db.RoadState.create({
      createdBy: createdBy.id,
      title,
      description,
      type: {
        type: typeCoordinates,
        coordinates: coordinates,
      },
      startDate: date1.toISOString().split("T")[0],
      startHour: date1.toISOString().split("T")[1].substring(0, 5),
      endDate: date2.toISOString().split("T")[0],
      endHour: date2.toISOString().split("T")[1].substring(0, 5),
      iconMap,
      recurrence,
      color,
    });

    const data = {
      ...result.dataValues,
      typeCoordinates: result.dataValues.type.type,
      coordinates: result.dataValues.type.coordinates,
      createdBy: undefined,
      type: undefined,
      deletedAt: undefined,
      startHour: undefined,
      endHour: undefined,
      startDate: startDate,
      endDate: endDate,
    };

    return res.status(StatusCodes.CREATED).json({ meta: null, data: data });
  } catch (error) {
    // console.error("Road state could not be created: ", error.message);
    return next(error);
  }
};

/**
 * Update a road state
 * @param {object} req - Object containing the id, title, description, startDate, endDate, iconMap, recurrence, typeCoordinates, coordinates
 * @return {object} Response contains: statusCode (integer), json (road state object updated) if 200OK. Or if there's error, json (object): status, code, detail
 */
exports.postEdit = async (req, res, next) => {
  try {

    const update = await validator.vWebPostEdit(req.body);

    const roadInDb = await db.RoadState.findOne({
      where: {
        id: update.id,
        // // ! Pendiente: Validar permisos del usuario
        // createdBy: createdBy.id,
      },
    });
    if (roadInDb == null)
      throw {
        message: "Road state not found",
        status: StatusCodes.NOT_FOUND,
      };
    
    delete update.id;
    if (update.typeCoordinates != null) {
      (update.type = {
        type: update.typeCoordinates,
        coordinates: update.coordinates,
      }),
      delete update.typeCoordinates;
      delete update.coordinates;
    }

    let startDate = undefined;
    let endDate = undefined;

    if (update.startDate != null) {
      startDate = update.startDate;
      const date1 = new Date(update.startDate);
      update.startDate = date1.toISOString().split("T")[0];
      update.startHour = date1.toISOString().split("T")[1].substring(0, 5);
    }
    if (update.endDate != null) {
      endDate = update.endDate;
      const date2 = new Date(update.endDate);
      update.endDate = date2.toISOString().split("T")[0];
      update.endHour = date2.toISOString().split("T")[1].substring(0, 5);
    }

    const resultUpdate = await roadInDb.update(update);

    const data = {
      ...resultUpdate.dataValues,
      typeCoordinates: resultUpdate.dataValues.type.type,
      coordinates: resultUpdate.dataValues.type.coordinates,
      createdBy: undefined,
      type: undefined,
      deletedAt: undefined,
      startHour: undefined,
      endHour: undefined,
      startDate: startDate,
      endDate: endDate,
    };
    return res.status(StatusCodes.OK).json({ data });
  } catch (error) {
    // console.error("Road state could not be updated: ", error.message);
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
 * Get the data of road state 
 * @param {integer} req.params.id - id of the road state
 * @return {object} Response contains: statusCode (integer), json (object): road state data. Or if there's error, json (object): status, code, detail
 */
exports.getOne = async (req, res, next) => {
  try {

    const { id } = await validator.vWebGetProfile({
      id: req.params.id ? parseInt(req.params.id) : null,
    });

    const roadInDb = await db.RoadState.findOne({
      where: {
        id,
        // // ! Pendiente: Validar permisos del usuario
        // createdBy: createdBy.id,
      },
      attributes: {
        exclude: ["createdBy", "deletedAt"],
      },
    });

    if (roadInDb == null)
      throw {
        message: "Road state could not be retrieved",
        status: StatusCodes.NOT_FOUND,
      };
    
    roadInDb.dataValues.typeCoordinates = roadInDb.dataValues.type.type;
    roadInDb.dataValues.coordinates = roadInDb.dataValues.type.coordinates;
    roadInDb.dataValues.startDate = `${roadInDb.dataValues.startDate}T${roadInDb.dataValues.startHour}:00.000Z`;
    roadInDb.dataValues.endDate = `${roadInDb.dataValues.endDate}T${roadInDb.dataValues.endHour}:00.000Z`;
    delete roadInDb.dataValues.startHour;
    delete roadInDb.dataValues.endHour;
    delete roadInDb.dataValues.type;

    return res.status(StatusCodes.OK).send({
      meta: null,
      data: roadInDb,
    });
  } catch (error) {
    // console.error("company could not be recovered: ", error.message);
    return next(error);
  }
};

/**
 * Destroy a road state (soft delete)
 * @return {object} Response contains: statusCode (integer), json (object): id. Or if there's error, json (object): status, code, detail
 */
exports.postDelete = async (req, res, next) => {
  try {    
    const { id } = await validator.vWebPostDelete(req.body);
    const roadInDb = await db.RoadState.findByPk( id, {
      // where: {
      //   id,
      //   // // ! Pendiente: Validar permisos del usuario
      //   // createdBy: createdBy.id,
      // },
      attributes: ["id"],
      paranoid: true,
    });

    if (roadInDb === null) {
      throw {
        status: StatusCodes.NOT_FOUND,
        message: `Road state does not found`,
      };
    }

    await roadInDb.destroy();
    return res.status(StatusCodes.OK).json({
      meta: null,
      data: { id },
    });
  } catch (error) {
    // console.error("Road state could not be deleted: ", error.message);
    return next(error);
  }
};

/**
 * Get all road states 
 * @param {object} req.query - Object containing the number and size
 * @return {object} Response contains: statusCode (integer), json (objeto): data road states. Or if there's error, json (objeto): status, code, detail
 */
exports.getAll = async (req, res, next) => {
  try {
    const objPage = await validator.vWebGetListAll({
      number: req.query.page ? parseInt(req.query.page.number) : null,
      size: req.query.page ? parseInt(req.query.page.size) : null,
    });

    const roadsInDb = await db.RoadState.findAndCountAll({
      limit: objPage.size,
      offset: (objPage.number - 1) * objPage.size,
      order: [["createdAt", "DESC"]], // Sort by date of creation in descending order
      attributes: {
        exclude: ["createdBy", "deletedAt"],
      },
    });

    let message = undefined;
    if (roadsInDb.count <= 0)
      message = "There are no road states registered";
    if (roadsInDb.rows.length <= 0)
      message = '"page[number]" is too large for the number of possible pages.';

    const data = roadsInDb.rows.map((row) => {
      return {
        ...row.dataValues,
        typeCoordinates: row.dataValues.type.type,
        coordinates: row.dataValues.type.coordinates,
        startDate: `${row.dataValues.startDate}T${row.dataValues.startHour}:00.000Z`,
        endDate: `${row.dataValues.endDate}T${row.dataValues.endHour}:00.000Z`,
        type: undefined,
        startHour: undefined,
        endHour: undefined,
      };
    });

    return res.status(StatusCodes.OK).json({
      meta: {
        message,
        page: objPage.number,
        pageSize: objPage.size,
        totalRecords: roadsInDb.count,
        totalPages: Math.ceil(roadsInDb.count / objPage.size),
      },
      data,
    });
  } catch (error) {
    // console.error("Tourism companies could not be recovered: ", error.message);
    return next(error);
  }
};
