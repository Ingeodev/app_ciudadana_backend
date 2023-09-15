const { StatusCodes } = require('http-status-codes');
const db = require('../../../../models');
const validator = require('../../utils/schemaValidator');
// const { Sequelize } = require('sequelize');

/**
 * Create a role
 * @param {object} req - Object containing the name, description, permission
 * @return {object} Response contains: statuscode (integer), json (objeto): echo reply, if 200OK. Or if there's error, json (objeto): status, code, detail
 */
exports.postRegister = async (req, res, next) => {
  try {
    const { name, description } = await validator.vWebPostRegister(req.body);
    const jsonFile = await validator.vMulterMemorySingleItemSchema(req.file);

    const dataQuery = {
      name,
      description,
      permission: jsonFile.buffer.toString('utf-8')
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
    const { id, name, description } = await validator.vWebPostEdit(
      req.body
    );
    const jsonFile = await validator.vMulterMemorySingleItemSchema(req.file);

    const dataQuery = {
      id,
      name,
      description,
      permission: jsonFile.buffer.toString("utf-8"),
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
      include: [
        {
          model: db.User,
          attributes: ["roleId"],
          required: false,
        },
      ],
      attributes: ["id"],
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
