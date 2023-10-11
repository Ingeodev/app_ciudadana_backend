const { StatusCodes } = require("http-status-codes");
const { Sequelize } = require("sequelize");
const fs = require("fs/promises");
const path = require("path");
const { v4: uuidV4 } = require("uuid");
const db = require("../../../../models/index.js");
const validator = require("../../utils/validatorReports.js");
const { checkIfExists } = require("../../utils/accessCheck.js");
const { filesMsHostUri } = require("../../../../utils/uriTransformer.js");

// const uploadsFolder = path.join("..", "..", "uploads", "private"); // TODO: transform in env var; ask Esteban.
const uploadsFolder = path.join("..", "..", "uploads"); // TODO: transform in env var; ask Esteban.

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
 * @param {object} req - Object containing the description, categoryId, userId, lat, lon, file (image)
 * @return {object} Response contains: statusCode (integer), json (objeto): echo reply, if 200OK. Or if there's error, json (objeto): status, code, detail
 */
exports.postRegister = async (req, res, next) => {
  try {
    const userData = await db.User.findOne({
      where: { disabled: false, userMobile: true, clientId: res.locals.uid },
      attributes: ["id"],
    });

    if (userData == null || userData.id == null)
      throw {
        message:
          "Requesting user is not allowed to create reports or is not registered in the database yet.",
        status: StatusCodes.FORBIDDEN,
      };

    const { description, categoryId, lat, lon } = await validator.vMobilePostRegister(JSON.parse(req.body.report));

    if (!(await checkCategoryExists(categoryId)))
      throw {
        status: StatusCodes.NOT_FOUND,
        message: "The assigned category does not exist.",
      };
    
    const pdfFile = await validator.vFileReports(req.file);
    let imageUri = undefined;

    if (pdfFile) {
      console.log("pdfFile");
      const endpoint = "mobileReports";
      const uploadDir = path.join(uploadsFolder, endpoint);
      const filename = uuidV4() + path.extname(pdfFile.originalname);
      // imageUri = `${filesMsHostUri}/api/v1/file_management/download/secure/${endpoint}/${filename}`;
      imageUri = `${filesMsHostUri}/api/v1/file_management/download/${endpoint}/${filename}`;

      const filepath = path.join(uploadDir, filename);
      await checkIfExists(uploadDir, true);
      await fs.writeFile(filepath, pdfFile.buffer);
    }

    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);


    const configInDb = await db.ReportConfiguration.findOne({
      attributes: ["automaticApproval"],
      order: [["createdAt", "DESC"]], // Ordered from current date
    });

    if (configInDb === null) {
      throw {
        status: StatusCodes.INTERNAL_SERVER_ERROR,
        message: "Report configuration data could not be retrieved",
      };
    }

    const dataQuery = {
      description,
      securityCategoryId: categoryId,
      userId: userData.id,
      imageUri,
      lat,
      lon,
      expiresAt,
      isApproved: configInDb.automaticApproval,
    };

    const result = await db.Report.create(dataQuery);
    return res.status(StatusCodes.CREATED).json({
      meta: null,
      data: {
        description,
        categoryId,
        lat,
        lon,
        image: result.dataValues.imageUri,
      },
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * Get the reports from the day that are closest to the user's location.
 * @return {object} Response contains: statusCode (integer), json (objeto): reports data. Or if there's error, json (objeto): status, code, detail
 */
exports.getListAllClosest = async (req, res, next) => {
  try {
    const { lat, lon } = await validator.vMobileGetCoordinates(req.query);

    var date = new Date();
    date.setDate(date.getDate() - 1);

    let order = [["createdAt", "DESC"]];
    // let order = [["description", "ASC"]];
    if (lat != null && lon != null && typeof lat == 'number' && typeof lon == 'number') {
      order = [[
        Sequelize.fn("ST_Distance",
          Sequelize.fn("ST_MakePoint", Sequelize.col('lon'), Sequelize.col('lat')),
          Sequelize.fn("ST_MakePoint", lon, lat)
        ),
        "ASC"]];
    }

    const reportsDb = await db.Report.findAndCountAll({
      where: {
        updatedAt: {
          [Sequelize.Op.gt]: date
        }
      },
      unique: true,
      paranoid: true,
      order,
      include: [{
        model: db.SecurityCategory,
        attributes: ['name'],
        required: false,
      }],
      attributes: [
        "id",
        "description",
        "securityCategoryId",
        "userId",
        "lat",
        "lon",
        [Sequelize.col('"Report"."iconMap"'), 'iconMap'],
        [Sequelize.col('"SecurityCategory"."name"'), 'securityCategoryName']
      ]
    });

    const data = reportsDb.rows.map(row => {
      return { ...row.dataValues, SecurityCategory: undefined };
    });

    return res.status(StatusCodes.OK).json(data);
  } catch (error) {
    return next(error);
  }
};
