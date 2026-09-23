const { StatusCodes } = require("http-status-codes");
const { v4: uuidV4 } = require("uuid");
const { Op } = require("sequelize");
const db = require("../../../../models/index.js");
const validator = require("../../utils/validatorPqrs.js");
const { transformSavedUriToSend } = require("../../../../utils/uriTransformer.js");
// const validator = require("../../utils/validatorAttentionLines.js");

/**
 * Get current attention line
 * @return {object} Response contains: statusCode (integer), json (objeto): data attention line. Or if there's error, json (objeto): status, code, detail
 */
exports.getAttentionLine = async (req, res, next) => {
  try {
    const attentionLineDb = await db.AttentionLine.findOne({
      attributes: ["phone", "whatsapp"],
      // Ordered from current date
      order: [["createdAt", "DESC"]],
    });

    if (attentionLineDb === null) {
      throw {
        status: StatusCodes.NOT_FOUND,
        message: "attention line information could not be retrieved",
      };
    }
    return res.status(StatusCodes.OK).send(attentionLineDb);
  } catch (error) {
    console.error("attention lines could not be recovered: ", error.message);
    return next(error);
  }
};

/**
 * Register a PQRSDF request.
 * @return {object} Response contains: statusCode (integer), json (objeto): created pqrs data including the radicado.
 */
exports.postPqrsdf = async (req, res, next) => {
  const transaction = await db.sequelize.transaction();
  try {
    const userData = await db.User.findOne({
      where: { clientId: res.locals.uid, userMobile: true, disabled: false },
      attributes: ["id"],
    });

    if (userData == null || userData.id == null)
      throw {
        message:
          "Requesting user is not allowed to create PQRS or is not registered in the database yet.",
        status: StatusCodes.FORBIDDEN,
      };

    let rawPqrs = req.body && req.body.pqrs;
    if (typeof rawPqrs !== "string") {
      throw {
        status: StatusCodes.BAD_REQUEST,
        message: "Missing field 'pqrs' with the request data.",
      };
    }

    let parsed;
    try {
      parsed = JSON.parse(rawPqrs);
    } catch (parseError) {
      throw {
        status: StatusCodes.BAD_REQUEST,
        message: "The 'pqrs' field is not a valid JSON string.",
      };
    }

    const pqrsData = await validator.vPqrsPostRegister(parsed);

    if (
      !(await db.Dependency.findByPk(pqrsData.dependencyId, {
        attributes: ["id"],
        paranoid: true,
      }))
    )
      throw {
        status: StatusCodes.NOT_FOUND,
        message: "The assigned dependency does not exist.",
      };

    if (
      pqrsData.documentTypeId &&
      !(await db.DocumentType.findByPk(pqrsData.documentTypeId, {
        attributes: ["id"],
        paranoid: true,
      }))
    )
      throw {
        status: StatusCodes.NOT_FOUND,
        message: "The assigned document type does not exist.",
      };

    const radicado = `PQRS-${uuidV4().replace(/-/g, "").toUpperCase().slice(0, 8)}`;

    const pqrsInDb = await db.Pqrs.create(
      {
        ...pqrsData,
        radicado,
        userId: userData.id,
      },
      { transaction }
    );

    await db.PqrsStatus.create(
      {
        pqrsId: pqrsInDb.dataValues.id,
        status: "ENVIADA",
      },
      { transaction }
    );

    await transaction.commit();
    return res.status(StatusCodes.CREATED).json({
      meta: null,
      data: {
        ...pqrsInDb.dataValues,
        PqrsStatuses: undefined,
        deletedAt: undefined,
      },
    });
  } catch (error) {
    await transaction.rollback();
    return next(error);
  }
};

/**
 * List the PQRS requests of the authenticated user.
 * @param {object} req.query - Object containing page[number], page[size], radicado and status filters.
 * @return {object} Response contains: statusCode (integer), json (objeto): meta with pagination info and the PQRS data list.
 */
exports.getPqrsdf = async (req, res, next) => {
  try {
    const userData = await db.User.findOne({
      where: { clientId: res.locals.uid, userMobile: true, disabled: false },
      attributes: ["id"],
    });

    if (userData == null || userData.id == null)
      throw {
        message:
          "Requesting user is not allowed to list PQRS or is not registered in the database yet.",
        status: StatusCodes.FORBIDDEN,
      };

    const filters = await validator.vPqrsGetList({
      number: req.query.page ? parseInt(req.query.page.number) : null,
      size: req.query.page ? parseInt(req.query.page.size) : null,
      radicado: req.query.radicado,
      status: req.query.status,
    });
    const offset = (filters.number - 1) * filters.size;

    const where = { userId: userData.id };

    if (filters.radicado) {
      where.radicado = { [Op.iLike]: `%${filters.radicado}%` };
    }

    // Latest status (and its timestamp) of each Pqrs.
    const latestStatusLiteral = `(SELECT ps.status FROM "PqrsStatuses" ps WHERE ps."pqrsId" = "Pqrs"."id" AND ps."deletedAt" IS NULL ORDER BY ps."createdAt" DESC LIMIT 1)`;
    const latestStatusDateLiteral = `(SELECT ps."createdAt" FROM "PqrsStatuses" ps WHERE ps."pqrsId" = "Pqrs"."id" AND ps."deletedAt" IS NULL ORDER BY ps."createdAt" DESC LIMIT 1)`;

    if (filters.status) {
      where[Op.and] = [db.sequelize.literal(`${latestStatusLiteral} = '${filters.status}'`)];
    }

    const pqrsDb = await db.Pqrs.findAndCountAll({
      where,
      distinct: true,
      paranoid: true,
      order: [["createdAt", "DESC"]],
      offset,
      limit: filters.size,
      include: [
        {
          model: db.Dependency,
          attributes: ["name"],
          required: false,
        },
        {
          model: db.PqrsResponse,
          attributes: ["id", "description", "fileUri", "createdAt"],
          required: false,
        },
      ],
      attributes: {
        exclude: ["deletedAt", "Dependency", "PqrsResponses"],
        include: [
          [db.sequelize.literal(latestStatusLiteral), "status"],
          [db.sequelize.literal(latestStatusDateLiteral), "statusDate"],
        ],
      },
    });

    let message = undefined;
    if (pqrsDb.count <= 0)
      message = "There are no PQRS registered for this user.";
    if (pqrsDb.rows.length <= 0)
      message = '"page[number]" is too large for the number of possible pages.';

    const data = pqrsDb.rows.map((row) => {
      const values = { ...row.dataValues, Dependency: undefined };
      values.dependencyName = row.dataValues.Dependency
        ? row.dataValues.Dependency.name
        : null;
      if (Array.isArray(values.PqrsResponses)) {
        values.PqrsResponses = values.PqrsResponses.map((response) => ({
          ...response,
          fileUri: transformSavedUriToSend(response.fileUri),
        }));
      }
      return values;
    });

    return res.status(StatusCodes.OK).json({
      meta: {
        message,
        page: filters.number,
        pageSize: filters.size,
        totalRecords: pqrsDb.count,
        totalPages: Math.ceil(pqrsDb.count / filters.size),
      },
      data,
    });
  } catch (error) {
    return next(error);
  }
};
