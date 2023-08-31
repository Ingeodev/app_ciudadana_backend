const { StatusCodes } = require("http-status-codes");
const { Sequelize } = require("sequelize");
const db = require("../../../../../models/index.js");
const validator = require("../../../utils/validators/mobile/companies.js");


/**
 * Get all companies with your services
 * @param {object} req.query - Object containing the number and size
 * @return {object} Response contains: statuscode (integer), json (objeto): companies data. Or if there's error, json (objeto): status, code, detail
 */
exports.getCompaniesnServices = async (req, res, next) => {
  try {
    // // ! Pendiente: Validar permisos del usuario
    // const createdBy = await db.User.findOne({
    //   where: { disabled: false, userMobile: false, clientId: res.locals.uid },
    //   attributes: ["id"],
    // });

    // if (createdBy == null || createdBy.id == null)
    //   throw {
    //     message: "User not found",
    //     status: StatusCodes.NOT_FOUND,
    //   };

    const objPage = await validator.vMobileGetCompaniesServices({
      lat: req.query.lat,
      lon: req.query.lon,
      number: req.query.page ? parseInt(req.query.page.number) : 1,
      size: req.query.page ? parseInt(req.query.page.size) : 100,
    });

    const refPoint = Sequelize.literal(`ST_GeomFromText('POINT(${objPage.lon} ${objPage.lat})')`);

    const companiesInDb = await db.ThirdPartyCompany.findAndCountAll({
      // // ! Pendiente: Validar permisos del usuario
      // where: { createdBy: createdBy.id },
      limit: objPage.size,
      offset: (objPage.number - 1) * objPage.size,
      order: Sequelize.literal(`ST_Distance(geolocation, ${refPoint.val}) ASC`),
      include: [
        {
          model: db.ThirdPartyCategory,
          attributes: ["name"],
          required: false,
        },
        {
          model: db.ThirdPartyService,
          attributes: ["service"],
          required: false,
        },
      ],
      attributes: {
        exclude: [
          "id",
          "nit",
          "createdBy",
          "siteUri",
          "createdAt",
          "updatedAt",
          "deletedAt",
          "imageUri",
        ],
        include: [
          "geolocation",
          "name",
          "description",
          "address",
          "phone",
          ["imageUri", "image"],
          // [db.Sequelize.col("imageUri"), "image"],
          "lat",
          "lon",
        ],
      },
    });

    if (companiesInDb.count <= 0)
      throw {
        status: StatusCodes.NOT_FOUND,
        message: "There are not companies registered",
      };
    if (companiesInDb.rows.length <= 0)
      throw {
        status: StatusCodes.BAD_REQUEST,
        message: '"page.number" is too large for the number of possible pages',
      };
    
    const transformedCompanies = companiesInDb.rows.map((company) => {
      const companyData = company.get({ plain: true }); // Convert Sequelize instance to simple object
      const categoryName = companyData.ThirdPartyCategory.name;
      delete companyData.ThirdPartyCategory;
      const services = companyData.ThirdPartyServices.map((obj) => obj.service);
      delete companyData.ThirdPartyServices;
      delete companyData.geolocation;

      return {
        ...companyData,
        categoryName,
        services,
      };
    });

    return res.status(StatusCodes.OK).send(transformedCompanies);
  } catch (error) {
    // console.error("companies could not be recovered: ", error.message);
    return next(error);
  }
};
