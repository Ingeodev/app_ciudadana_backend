const { StatusCodes } = require("http-status-codes");
const db = require("../../../../models/index.js");
const validator = require("../../utils/validatorReportConfigurations.js");

/**
 * Create report configuration
 * @param {boolean} req.body.automaticApproval - true, if you want to enable automatic report approval
 * @return {object} Response contains: statusCode (integer), json (objeto): echo reply, if 200OK. Or if there's error, json (objeto): status, code, detail
 */
exports.postRegister = async (req, res, next) => {
  try {
    const userInDb = await db.User.findOne({
      where: { disabled: false, userMobile: false, clientId: res.locals.uid },
      attributes: ["id"],
    });

    if (userInDb == null || userInDb.id == null)
      throw {
        message: "Requesting user is not allowed to create report configurations or is not registered in the database yet.",
        status: StatusCodes.FORBIDDEN,
      };

    const { automaticApproval } = await validator.vWebPostRegister(req.body);

    const result = await db.ReportConfiguration.create({
      automaticApproval,
      createdBy: userInDb.id,
    });
    return res
      .status(StatusCodes.CREATED)
      .json({
        meta: null,
        data: { automaticApproval: result.automaticApproval },
      });
  } catch (error) {
    // console.error("report configuration could not be created: ", error.message);
    return next(error);
  }
};

/**
 * Get current report configuration
 * @return {object} Response contains: statusCode (integer), json (objeto): report configuration data. Or if there's error, json (objeto): status, code, detail
 */
exports.getReportConfig = async (req, res, next) => {
  try {
    const configInDb = await db.ReportConfiguration.findOne({
      attributes: ["automaticApproval"],
      order: [["createdAt", "DESC"]], // Ordered from current date
    });

    if (configInDb === null) {
      throw {
        status: StatusCodes.NOT_FOUND,
        message: "Report configuration data could not be retrieved",
      };
    }
    return res.status(StatusCodes.OK).json({
      meta: null,
      data: { automaticApproval: configInDb.automaticApproval },
    });
  } catch (error) {
    // console.error("report configuration could not be created: ", error.message);
    return next(error);
  }
};
