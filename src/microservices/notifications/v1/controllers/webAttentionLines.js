const { StatusCodes } = require("http-status-codes");
const db = require("../../../../models/index.js");
// const firebase = require("../utils/firebaseAdmin.js");
const { formatDate } = require("../../../../middleware/formatDate.js");
const validator = require("../../utils/validatorAttentionLines.js");

/**
 * Create attention line
 * @param {object} req - Object containing the name, phone, imageUri, imageSiteUri, whatsapp, url
 * @return {object} Response contains: statuscode (integer), json (objeto): echo reply, if 200OK. Or if there's error, json (objeto): status, code, detail
 */
exports.postRegister = async (req, res, next) => {
  try {
    const { name, phone, imageUri, imageSiteUri, whatsapp, url } = await validator.vWebPostRegister(req.body);

    // ! Evitar la inyeccion de codigo SQL
    const dataQuery = {
      name,
      phone,
      imageUri,
      imageSiteUri,
      whatsapp,
      url,
      active: true,
      createdAt: formatDate(new Date()),
    };
    
    // ! Como retornar el id??
    await db.AttentionLine.create(dataQuery);
    return res.status(StatusCodes.OK).json({ meta: null, data: dataQuery });
  } catch (error) {
    console.error(
      "attention line could not be created: ",
      error.message
    );
    return next(error);
  }
};

/**
 * Update attention line
 * @param {object} req - Object containing the id, name, phone, imageUri, imageSiteUri, whatsapp, url
 * @return {object} Response contains: statuscode (integer), json (objeto): echo reply, if 200OK. Or if there's error, json (objeto): status, code, detail
 */
exports.postUpdate = async (req, res, next) => {
  try {
    const { id, name, phone, imageUri, imageSiteUri, whatsapp, url } =
      await validator.vWebPostUpdate(req.body);

    // ! Evitar la inyeccion de codigo SQL
    const dataQuery = {
      id,
      name,
      phone,
      imageUri,
      imageSiteUri,
      whatsapp,
      url,
      updatedAt: formatDate(new Date()),
    };

    const resultUpdate = await db.AttentionLine.update(dataQuery, {
      where: { id },
    });
    if (resultUpdate[0] === 0) {
      await transactionSequelize.rollback();
      return res.status(StatusCodes.BAD_REQUEST).json({
        status: StatusCodes.BAD_REQUEST,
        code: "Bad Request",
        detail: "invalid input",
      });
    }
    return res.status(StatusCodes.OK).json({ meta: null, data: dataQuery });
  } catch (error) {
    console.error(
      "attention line could not be updated: ",
      error.message
    );
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
 * Get all attention lines
 * @return {object} Response contains: statuscode (integer), json (objeto): data attention lines. Or if there's error, json (objeto): status, code, detail
 */
exports.getListAll = async (req, res, next) => {
  try {
    const { page, pageSize } = await validator.vWebGetListAll({
      // ! Obligatorio paginacion para Front
      page: parseInt(req.query.page) || null,
      pageSize: parseInt(req.query.pageSize) || null,
    });

    // Case pagination
    const attentionLInDb = await db.AttentionLine.findAndCountAll({
      limit: pageSize,
      offset: (page - 1) * pageSize,
      // ! Validar ordenamiento
      order: [["createdAt", "DESC"]], // Sort by date of creation in descending order
    });

    if (attentionLInDb.count === 0) {
      throw {
        status: StatusCodes.NOT_FOUND,
        message: "attention lines could not be recovered",
      };
    }

    const responseCustom = {
      meta: {
        page,
        pageSize,
        totalRecords: attentionLInDb.count,
        totalPages: Math.ceil(attentionLInDb.count / pageSize),
      },
      data: attentionLInDb.rows,
    };

    return res.status(StatusCodes.OK).send(responseCustom);
  } catch (error) {
    console.error("attention lines could not be recovered: ", error.message);
    if (error.status == StatusCodes.BAD_REQUEST) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        status: StatusCodes.BAD_REQUEST,
        code: "Bad Request",
        detail: error.message,
      });
    }
    return next(error);
  }
};

/**
 * Get attention line by id
 * @return {object} Response contains: statuscode (integer), json (objeto): data attention line. Or if there's error, json (objeto): status, code, detail
 */
exports.getAttentionLine = async (req, res, next) => {
  try {
    
    const { id } = await validator.vWebGetOne({
      id: parseInt(req.params.id),
    });

    const attentionLInDb = await db.AttentionLine.findOne({
      where: { id }
    });

    if (attentionLInDb === null) {
      return res.status(StatusCodes.NOT_FOUND).json({
        status: StatusCodes.NOT_FOUND,
        code: "Not found",
        detail: "attention line information could not be retrieved",
      });
    }

    return res
      .status(StatusCodes.OK)
      .send({ meta: null, data: attentionLInDb });
  } catch (error) {
    console.error("attention lines could not be recovered: ", error.message);
    return next(error);
  }
};

/**
 * Update the status of the attentionLines.active field (enabled/disabled) for a attention line
 * @return {object} Response contains: statuscode (integer), json (objeto): data attention line. Or if there's error, json (objeto): status, code, detail
 */
exports.postUpdateActive = async (req, res, next) => {
  const transactionSequelize = await db.sequelize.transaction();

  try {
    const { id, active } = await validator.vWebPostUpdateActive(req.body);
    const dataQuery = {}
    if (active === false) {
      dataQuery = {
        active,
        deleteAt: formatDate(new Date()),
      };
    }
    dataQuery = {
      active
    };

    const resultUpdate = await db.AttentionLine.update(
      dataQuery,
      { where: { id } },
      { transaction: transactionSequelize }
    );

    if (resultUpdate[0] === 0) {
      await transactionSequelize.rollback();
      return res.status(StatusCodes.BAD_REQUEST).json({
        status: StatusCodes.BAD_REQUEST,
        code: "Bad Request",
        detail: "invalid input",
      });
    }
    await transactionSequelize.commit();
    return res
      .status(StatusCodes.OK)
      .send({ meta: null, data: { id, active } });
  } catch (error) {
    console.error("attention line could not be updated: ", error.message);
    await transactionSequelize.rollback();
    if (error.status == StatusCodes.BAD_REQUEST) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        status: StatusCodes.BAD_REQUEST,
        code: "Bad Request",
        detail: error.message,
      });
    }
    return next(error);
  }
};