const { StatusCodes } = require("http-status-codes");
const { Sequelize } = require("sequelize");
const fs = require("fs/promises");
const path = require("path");
const { v4: uuidV4 } = require("uuid");
const db = require("../../../../models/index.js");
const validator = require("../../utils/validatorReports.js");
const { checkIfExists } = require("../../utils/accessCheck.js");
const { filesMsHostUri } = require("../../../../utils/uriTransformer.js");

const uploadsFolder = path.join('..', '..', 'uploads', 'private'); // TODO: transform in env var; ask Esteban.

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
 * @param {object} req - Object containing the title, description, categoryId, userId, lat, lon
 * @return {object} Response contains: statuscode (integer), json (objeto): echo reply, if 200OK. Or if there's error, json (objeto): status, code, detail
 */
exports.postRegister = async (req, res, next) => {
  try {
    const { title, description, categoryId, lat, lon } =
      await validator.vMobilePostRegister(JSON.parse(req.body.report));

    if (!(await checkCategoryExists(categoryId)))
      throw {
        status: StatusCodes.NOT_FOUND,
        message: "The assigned category does not exist.",
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
    
    const pdfFile = await validator.vfileReports(req.file);
    const endpoint = "mobileReports";
    const uploadDir = path.join(uploadsFolder, endpoint);
    const filename = uuidV4() + path.extname(pdfFile.originalname);
    const imageUri = `${filesMsHostUri}/api/v1/file_management/download/secure/${endpoint}/${filename}`;

    const filepath = path.join(uploadDir, filename);
    await checkIfExists(uploadDir, true);
    await fs.writeFile(filepath, pdfFile.buffer);

    const dataQuery = {
      title,
      description,
      securityCategoryId: categoryId,
      userId: userData.id,
      imageUri,
      lat,
      lon,
    };

    const result = await db.Report.create(dataQuery);
    return res.status(StatusCodes.CREATED).json({
      meta: null,
      data: { title, description, categoryId, lat, lon, image: result.dataValues.imageUri },
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * Get the reports from the day that are closest to the user's location.
 * @return {object} Response contains: statuscode (integer), json (objeto): reports data. Or if there's error, json (objeto): status, code, detail
 */
exports.getListAllClosest = async (req, res, next) => {
  try {
    const { lat, lon } = await validator.vMobileGetCoordinates(req.query);

    var date = new Date();
    date.setDate(date.getDate() - 1);

    // let order = [["createdAt", "DESC"]];
    let order = [["title", "ASC"]];
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
      attributes: {
        exclude: ["createdAt", "updatedAt", "deletedAt", "SecurityCategory"],
        include: [
          [Sequelize.col('"Report"."imageUri"'), 'image'],
          [Sequelize.col('"SecurityCategory"."name"'), 'securityCategoryName']
        ],
      },
    });

    const data = reportsDb.rows.map(row => {
      return { ...row.dataValues, SecurityCategory: undefined };
    });

    return res.status(StatusCodes.OK).json(data);
  } catch (error) {
    return next(error);
  }
};
