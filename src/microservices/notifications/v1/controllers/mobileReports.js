const { StatusCodes } = require("http-status-codes");
const { fn, col, Op } = require("sequelize");
const fs = require("fs/promises");
const path = require("path");
const { v4: uuidV4 } = require("uuid");
const db = require("../../../../models/index.js");
const validator = require("../../utils/validatorReports.js");
const { checkIfExists } = require("../../utils/accessCheck.js");
const { filesMsHostUri } = require("../../../../utils/uriTransformer.js");
const { formatColorOutputForMobile } = require("../../../../utils/mobileColorFormatter.js");

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
  const transaction = await db.sequelize.transaction();
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

    const { description, categoryId, lat, lon } =
      await validator.vMobilePostRegister(JSON.parse(req.body.report));

    if (!(await checkCategoryExists(categoryId)))
      throw {
        status: StatusCodes.NOT_FOUND,
        message: "The assigned category does not exist.",
      };

    const pdfFile = await validator.vFileReports(req.file);
    let imageUri = undefined;

    if (pdfFile) {
      const endpoint = "mobileReports";
      const uploadDir = path.join(uploadsFolder, endpoint);
      const filename = uuidV4() + path.extname(pdfFile.originalname);
      // imageUri = `${filesMsHostUri}/api/v1/file_management/download/secure/${endpoint}/${filename}`;
      imageUri = `${filesMsHostUri}/api/v1/file_management/download/${endpoint}/${filename}`;

      const filepath = path.join(uploadDir, filename);
      await checkIfExists(uploadDir, true);
      await fs.writeFile(filepath, pdfFile.buffer);
    }

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

    // If automatic approval is enabled (true)
    let isApproved = null;
    let expiresAt = null;
    let status = "PENDING";
    if (configInDb.automaticApproval) {
      expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 24);
      isApproved = "yes";
      status = "APPROVED";
    }

    const reportInDb = await db.Report.create(
      {
        description,
        securityCategoryId: categoryId,
        userId: userData.id,
        imageUri,
        lat,
        lon,
        expiresAt,
        isApproved,
      },
      { transaction }
    );

    await db.ReportStatus.create(
      {
        reportId: reportInDb.dataValues.id,
        status,
      },
      { transaction }
    );

    await transaction.commit();
    return res.status(StatusCodes.CREATED).json({
      meta: null,
      data: {
        description,
        categoryId,
        lat,
        lon,
        image: reportInDb.dataValues.imageUri,
      },
    });
  } catch (error) {
    await transaction.rollback();
    return next(error);
  }
};

/**
 * Get the approved and not expired reports. They can be sorted by proximity or by date of creation.
 * @param {object} req.query - Object containing the number, size, lat, lon
 * @return {object} Response contains: statusCode (integer), json (objeto): reports data. Or if there's error, json (objeto): status, code, detail
 */
exports.getListAllClosest = async (req, res, next) => {
  try {
    const { size, number, lat, lon } = await validator.vMobileGetListAllClosest({
      lat: req.query.lat,
      lon: req.query.lon,
      number: req.query.page ? parseInt(req.query.page.number) : 1,
      size: req.query.page ? parseInt(req.query.page.size) : 100,
    });

    let order = [["createdAt", "DESC"]];
    if (lat != null && lon != null && typeof lat == 'number' && typeof lon == 'number') {
      order = [[
        fn("ST_Distance",
          fn("ST_MakePoint", col('lon'), col('lat')),
          fn("ST_MakePoint", lon, lat)
        ),
        "ASC"]];
    }

    const reportsDb = await db.Report.findAndCountAll({
      where: {
        expiresAt: {
          [Op.gt]: new Date(),
        },
        isApproved: "yes",
      },
      paranoid: true,
      limit: size,
      offset: (number - 1) * size,
      order,
      include: [
        {
          model: db.SecurityCategory,
          attributes: ["name", "color", "iconMap"],
          required: false,
        },
      ],
      attributes: [
        "id",
        "createdAt",
        [col('"SecurityCategory"."name"'), "name"],
        [col('"Report"."securityCategoryId"'), "categoryId"],
        [col('"SecurityCategory"."color"'), "color"],
        [col('"SecurityCategory"."iconMap"'), "iconMap"],
        "description",
        [col('"Report"."imageUri"'), "image"],
        "lat",
        "lon",
      ],
    });

    const data = reportsDb.rows.map(row => {
      return {
        ...row.dataValues,
        SecurityCategory: undefined,
        color: formatColorOutputForMobile(row.dataValues.color),
      };
    });

    return res.status(StatusCodes.OK).json(data);
  } catch (error) {
    return next(error);
  }
};
