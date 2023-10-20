const { StatusCodes } = require("http-status-codes");
const { Sequelize } = require("sequelize");
const db = require("../../../../../models/index.js");
const validator = require("../../../utils/validators/mobile/companies.js");


/**
 * Get all companies with your services
 * @param {object} req.query - Object containing the number, size, lat, n lon
 * @return {object} Response contains: statusCode (integer), json (objeto): companies data. Or if there's error, json (objeto): status, code, detail
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

    let order = [["name", "ASC"]];
    if (objPage.lat != null && objPage.lon != null && typeof objPage.lat == 'number' && typeof objPage.lon == 'number') {
      order = [[
        Sequelize.fn("ST_Distance",
          Sequelize.col('geolocation'),
          Sequelize.fn("ST_MakePoint", objPage.lon, objPage.lat)
        ),
        "ASC"]];
    }

    const companiesInDb = await db.ThirdPartyCompany.findAndCountAll({
      // // ! Pendiente: Validar permisos del usuario
      // where: { createdBy: createdBy.id },
      limit: objPage.size,
      offset: (objPage.number - 1) * objPage.size,
      order,
      include: [
        {
          model: db.ThirdPartyService,
          attributes: ["service"],
          required: false,
        },
      ],
      attributes: [
        "id",
        "categoryId",
        "geolocation",
        "name",
        "description",
        "address",
        "phone",
        [Sequelize.col("imageUri"), "image"],
        "lat",
        "lon",
      ],
    });

    const transformedCompanies = companiesInDb.rows.map((company) => {
      const companyData = company.get({ plain: true }); // Convert Sequelize instance to simple object
      if (company.phone != null) {
        company.phone = String(company.phone).replace("+57", "");
      }
      if (companyData.ThirdPartyCategory == null) companyData.ThirdPartyCategory = { name: null };
      delete companyData.ThirdPartyCategory;
      if (companyData.ThirdPartyServices == null) companyData.ThirdPartyServices = [];
      const services = companyData.ThirdPartyServices.map((obj) => obj.service);
      delete companyData.ThirdPartyServices;
      delete companyData.geolocation;

      return {
        ...companyData,
        services,
      };
    });

    return res.status(StatusCodes.OK).json(transformedCompanies);
  } catch (error) {
    // console.error("companies could not be recovered: ", error.message);
    return next(error);
  }
};
