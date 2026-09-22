const { StatusCodes } = require("http-status-codes");
const { fn, col, Op } = require("sequelize");
const { v4: uuidV4 } = require("uuid");
const path = require("path");
const db = require("../../../../models/index.js");
const validator = require("../../utils/validatorReports.js");
const admin = require("firebase-admin");
const { filesMsHostUri } = require("../../../../utils/uriTransformer.js");
const { formatColorOutputForMobile } = require("../../../../utils/mobileColorFormatter.js");
const { dateHourWithOffset } = require("../../../../utils/utcZone.js");

const uploadFileToStorage = async (file, folder) => {
  const filename = uuidV4() + path.extname(file.originalname);
  const filePath = `${folder}/${filename}`;
  const bucket = admin.storage().bucket();
  await bucket.file(filePath).save(file.buffer, {
    metadata: { contentType: file.mimetype },
  });
  return `${filesMsHostUri}/api/v1/file_management/download/${folder}/${filename}`;
};

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

    if (!(await db.SecurityCategory.findByPk(categoryId, { attributes: ['id'], paranoid: true })))
      throw {
        status: StatusCodes.NOT_FOUND,
        message: "The assigned category does not exist.",
      };

    let imageUri = undefined;
    if (req.file) {
      const file = await validator.vFileReports(req.file);
      imageUri = await uploadFileToStorage(file, "mobileReports");
    }

    const configInDb = await db.ReportConfiguration.findOne({
      attributes: ["automaticApproval"],
      order: [["createdAt", "DESC"]],
    });

    if (configInDb === null) {
      throw {
        status: StatusCodes.INTERNAL_SERVER_ERROR,
        message: "Report configuration data could not be retrieved",
      };
    }

    let isApproved = null;
    let expiresAt = null;
    let status = "PENDING";
    if (configInDb.automaticApproval) {
      expiresAt = dateHourWithOffset().plus({ days: 1 });
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