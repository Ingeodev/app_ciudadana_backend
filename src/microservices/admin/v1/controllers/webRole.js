const { StatusCodes } = require('http-status-codes');
const db = require('../../../../models');
const validator = require('../../utils/schemaValidator');
const { Op } = require('sequelize');

/**
 * Create a role
 * @param {object} req - Object containing the name, description, permission
 * @return {object} Response contains: statuscode (integer), json (objeto): echo reply, if 200OK. Or if there's error, json (objeto): status, code, detail
 */
exports.postRegister = async (req, res, next) => {
  try {
    const { name, description, permission } = await validator.vWebPostRegister(req.body);
    // const jsonFile = await validator.vMulterMemorySingleItemSchema(req.file);

    const dataQuery = {
      name,
      description,
      permission,
      // permission: jsonFile.buffer.toString('utf-8')
    };

    const result = await db.Role.create(dataQuery);
    delete result.dataValues.deletedAt;
    return res.status(StatusCodes.CREATED).json({ meta: null, data: result });
  } catch (error) {
    // console.error("Role could not be created: ", error.message);
    return next(error);
  }
};

/**
 * Update a role
 * @param {object} req - Object containing the id, name, description, permission
 * @return {object} Response contains: statuscode (integer), json (Role object updated) if 200OK. Or if there's error, json (objeto): status, code, detail
 */
exports.postEdit = async (req, res, next) => {
  try {
    const { id, name, description, permission } = await validator.vWebPostEdit(
      req.body
    );
    // const jsonFile = await validator.vMulterMemorySingleItemSchema(req.file);

    const dataQuery = {
      id,
      name,
      description,
      // permission: jsonFile.buffer.toString("utf-8"),
      permission,
    };

    const roleInDb = await db.Role.findByPk(id);

    if (roleInDb === null) {
      throw {
        status: StatusCodes.NOT_FOUND,
        message: `Role does not exist`,
      };
    }

    const resultUpdate = await roleInDb.update(dataQuery);
    delete resultUpdate.dataValues.deletedAt;
    return res.status(StatusCodes.OK).json({
      meta: null,
      data: resultUpdate,
    });
  } catch (error) {
    // console.error("Role could not be updated: ", error.message);
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
 * Get all Roles
 * @param {object} req.query - Object containing the number, and size
 * @return {object} Response contains: statuscode (integer), json (objeto): data Roles. Or if there's error, json (objeto): status, code, detail
 */
exports.getAll = async (req, res, next) => {
  try {
    const objPage = await validator.vWebGetAll({
      number: req.query.page ? parseInt(req.query.page.number) : null,
      size: req.query.page ? parseInt(req.query.page.size) : null,
    });

    const rolesInDb = await db.Role.findAndCountAll({
      limit: objPage.size,
      offset: (objPage.number - 1) * objPage.size,
      order: [["name", "ASC"]],
      attributes: {
        exclude: ["deletedAt"],
      },
    });

    if (rolesInDb.count <= 0) {
      throw {
        status: StatusCodes.NOT_FOUND,
        message: "There are no roles registered",
      };
    }
    if (rolesInDb.rows.length <= 0) {
      throw {
        status: StatusCodes.BAD_REQUEST,
        message: '"page.number" is too large for the number of possible pages',
      };
    }
    const totalPages = Math.ceil(rolesInDb.count / objPage.size);

    const responseCustom = {
      meta: {
        page: objPage.number,
        pageSize: objPage.size,
        totalRecords: rolesInDb.count,
        totalPages: totalPages,
      },
      data: rolesInDb.rows,
    };

    return res.status(StatusCodes.OK).send(responseCustom);
  } catch (error) {
    // console.error("Roles could not be recovered: ", error.message);
    return next(error);
  }
};

/**
 * Destroy a Role (soft delete)
 * @return {object} Response contains: statuscode (integer), json (objeto): id. Or if there's error, json (objeto): status, code, detail
 */
exports.postDelete = async (req, res, next) => {
  try {
    const { id } = await validator.vWebPostDelete(req.body);
    const rolesInDb = await db.Role.findByPk(id, {
      attributes: ["id"],
      include: [
        {
          model: db.User,
          attributes: ["id"],
          required: false,
        },
      ],
      paranoid: true,
    });

    if (rolesInDb === null) {
      throw {
        status: StatusCodes.NOT_FOUND,
        message: `Role does not exist`,
      };
    }

    if (rolesInDb.Users.length != 0 )
      throw {
        status: StatusCodes.UNPROCESSABLE_ENTITY,
        message: `Role has related users`,
      };

    await rolesInDb.destroy();

    return res.status(StatusCodes.OK).json({
      meta: null,
      data: { id },
    });
  } catch (error) {
    // console.error("Role could not be deleted: ", error.message);
    return next(error);
  }
};

/**
 * Assign a role to a user
 * @param {object} req - Object containing the userId n roleId
 * @return {object} Response contains: statuscode (integer), json object: userId n roleId, if 200OK. Or if there's error, json (objeto): status, code, detail
 */
exports.postAssignRoleToUser = async (req, res, next) => {
  try {
    // ! Pendiente: Validar permisos del usuario

    const { userId, roleId } = await validator.vWebPostAssignRoleToUser(
      req.body
    );

    // Check if the user exists
    const userInDb = await db.User.findByPk(userId, {
      attributes: ["id"],
      paranoid: true,
      // ! Solo usuario web?
    });
    if (userInDb === null) {
      throw {
        status: StatusCodes.NOT_FOUND,
        message: `User does not exist`,
      };
    }

    // Check if the role exists
    const roleInDb = await db.Role.findByPk(roleId, {
      attributes: ["id"],
      paranoid: true,
    });
    if (roleInDb === null) {
      throw {
        status: StatusCodes.NOT_FOUND,
        message: `Role does not exist`,
      };
    }

    const result = await userInDb.update({ roleId });
    delete result.dataValues.deletedAt;
    return res.status(StatusCodes.OK).json({ meta: null, data: { userId, roleId } });
  } catch (error) {
    // console.error("Role could not be assign: ", error.message);
    return next(error);
  }
};

/**
 * Get the users that have a certain role
 * @param {object} req.query - Object containing the roleId, number, and size
 * @return {object} Response contains: statuscode (integer), json (objeto): data Roles. Or if there's error, json (objeto): status, code, detail
 */
exports.getUsersByRoleId = async (req, res, next) => {
  try {
    const objPage = await validator.vWebGetUsersByRoleId({
      roleId: req.query.roleId ? parseInt(req.query.roleId) : null,
      number: req.query.page ? parseInt(req.query.page.number) : null,
      size: req.query.page ? parseInt(req.query.page.size) : null,
    });

    let whereCondition = {};

    if (objPage.roleId) {
      whereCondition.roleId = objPage.roleId;
    } else {
      whereCondition.roleId = { [Op.ne]: null };
    }

    const usersInDb = await db.User.findAndCountAll({
      where: whereCondition,
      limit: objPage.size,
      offset: (objPage.number - 1) * objPage.size,
      order: [["name", "ASC"]],
      attributes: {
        exclude: [
          "deletedAt",
          "serviceReceiptUri",
          "pushDeviceToken",
          "emailVerified",
          "clientId",
          "documentTypeId",
          "document",
          "loginPhase",
        ],
      },
    });

    if (usersInDb.count <= 0) {
      throw {
        status: StatusCodes.NOT_FOUND,
        message: "There are no users with this role",
      };
    }
    if (usersInDb.rows.length <= 0) {
      throw {
        status: StatusCodes.BAD_REQUEST,
        message: '"page.number" is too large for the number of possible pages',
      };
    }
    const totalPages = Math.ceil(usersInDb.count / objPage.size);

    const responseCustom = {
      meta: {
        page: objPage.number,
        pageSize: objPage.size,
        totalRecords: usersInDb.count,
        totalPages: totalPages,
      },
      data: usersInDb.rows,
    };

    return res.status(StatusCodes.OK).send(responseCustom);
  } catch (error) {
    // console.error("Users with this role could not be recovered: ", error.message);
    return next(error);
  }
};
