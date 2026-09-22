const { StatusCodes } = require("http-status-codes");
const { v4: uuidV4 } = require("uuid");
const db = require("../../../../models/index.js");
const validator = require("../../utils/validatorPqrs.js");
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

    if (pqrsData.userId != null) {
      const user = await db.User.findByPk(pqrsData.userId, {
        attributes: ["id"],
        paranoid: true,
      });
      if (user === null)
        throw {
          status: StatusCodes.NOT_FOUND,
          message: "The assigned user does not exist.",
        };
    }

    const radicado = `PQRS-${uuidV4().replace(/-/g, "").toUpperCase().slice(0, 8)}`;

    const pqrsInDb = await db.Pqrs.create(
      {
        ...pqrsData,
        radicado,
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
