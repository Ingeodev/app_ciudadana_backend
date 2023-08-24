const { StatusCodes } = require("http-status-codes");
const db = require("../../../../models/index.js");
// const firebase = require("../utils/firebaseAdmin.js");
// const { formatDate } = require("../../../../middleware/formatDate.js");
const validator = require("../../utils/validatorReports.js");
const { Sequelize } = require("sequelize");

/**
 * Checks whether an SecurityCategory ID exists and refers to an existing category.
 * @param {number} categoryId The ID of an SecurityCategory, or ``null``.
 * @returns {boolean} `true` if the `categoryId` is `null` or exists in the SecurityCategory table. ``false`` otherwise.
 */
const checkCategoryExists = async (categoryId) => {
  if (categoryId != null) {
    const categoryExists = await db.SecurityCategory.findByPk(categoryId, { attributes: ['id'], paranoid: true });
    if (categoryExists == null)
      return false;
  }
  return true;
};

/**
 * Create report
 * @param {object} req - Object containing the title, description, securityCategoryId, userId, imageUri, lat, lon
 * @return {object} Response contains: statuscode (integer), json (objeto): echo reply, if 200OK. Or if there's error, json (objeto): status, code, detail
 */
exports.postRegister = async (req, res, next) => {
  try {
    const { 
      title, 
      description, 
      securityCategoryId, 
      imageUri, 
      lat, 
      lon 
    } = await validator.vMobilePostRegister(req.body);

    if (!await checkCategoryExists(securityCategoryId))
      throw {
          status: StatusCodes.NOT_FOUND,
          message: 'The assigned category does not exist.',
      };

    const userData = await db.User.findOne({
      where: { disabled: false, userMobile: true, clientId: res.locals.uid },
      attributes: ['id'],
    });

    if (userData == null || userData.id == null)
      throw {
        message: 'Requesting user is not allowed to create reports or is not registered in the database yet.',
        status: StatusCodes.FORBIDDEN,
      };

    const usersCount = await db.User.count({
      where: { disabled: false, userMobile: true },
    });

    if (usersCount <= 0)
      throw {
        message: 'No mobile users registered in the database.',
        status: StatusCodes.NOT_FOUND,
      };

    const dataQuery = {
      title, 
      description, 
      securityCategoryId, 
      userId: userData.id, 
      imageUri, 
      lat, 
      lon
    };
    
    const result = await db.Report.create(dataQuery);
    return res.status(StatusCodes.CREATED).json({ meta: null, data: result });
  } catch (error) {
    console.error(
      "report could not be created: ",
      error.message
    );
    return next(error);
  }
};

/**
 * Get the reports from the day that are closest to the user's location.
 * @return {object} Response contains: statuscode (integer), json (objeto): reports data. Or if there's error, json (objeto): status, code, detail
 */
exports.getListAllClosest = async (req, res, next) => {
  try {
    // const objPage = await validator.vMobileGetListAllClosest({
    //   number: req.query.page ? parseInt(req.query.page.number) : 1,
    //   size: req.query.page ? parseInt(req.query.page.size) : 100,
    // });
    // const offset = (objPage.number - 1) * objPage.size;

    const { lat, lon } = await validator.vMobileGetCoordinates({
      lat: parseFloat(req.query.lat),
      lon: parseFloat(req.query.lon),
    });

    var date = new Date();
    date.setDate(date.getDate() - 1);

    const reportsDb = await db.Report.findAndCountAll({
      where: { 
        updatedAt: {
          [Sequelize.Op.gt]: date
        } 
      },
      unique: true,
      paranoid: true,
      order: [["createdAt", "DESC"]],
      // offset,
      // limit: objPage.size,
      include: [{
        model: db.SecurityCategory,
        attributes: ['name'],
        required: false,
      }],
      attributes: {
        exclude: ["deletedAt", "SecurityCategory"],
        include: [
          [Sequelize.col('"SecurityCategory"."name"'), 'securityCategoryName']
        ],
      },
    });

    if (reportsDb.count <= 0)
      throw {
        status: StatusCodes.NOT_FOUND,
        message: 'There are no Reports registered in the database.',
      };
    if (reportsDb.rows.length <= 0)
      throw {
        status: StatusCodes.BAD_REQUEST,
        message: '"page.number" is too large for the number of possible pages.',
      };

    const data = reportsDb.rows.map(row => {
      return { ...row.dataValues, SecurityCategory: undefined };
    });

    return res.status(StatusCodes.OK).json({
      meta: null,
      // meta: {
      //   page: objPage.number,
      //   pageSize: objPage.size,
      //   totalRecords: reportsDb.count,
      //   totalPages: Math.ceil(reportsDb.count / objPage.size),
      // },
      data,
    });
  } catch (error) {
    return next(error);
  }
};
