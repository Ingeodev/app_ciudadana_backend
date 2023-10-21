const { StatusCodes } = require("http-status-codes");
const { fn, col } = require("sequelize");
const db = require("../../../../../models/index");
const validator = require("../../../utils/validators/mobile/tourismCompanies.js");
// const { formatColorOutputForMobile } = require("../../../../../utils/mobileColorFormatter");

/**
 * Get all tourism companies with your services
 * @param {object} req.query - Object containing the number, size, lat, n lon
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

    let order = [["name", "ASC"]];
    if (objPage.lat != null && objPage.lon != null && typeof objPage.lat == 'number' && typeof objPage.lon == 'number') {
      order = [[
        fn("ST_Distance",          
          col('geolocation'),
          fn("ST_MakePoint", objPage.lon, objPage.lat)
        ),
        "ASC"]];
    }

    const companiesInDb = await db.TourismCompany.findAndCountAll({
      // // ! Pendiente: Validar permisos del usuario
      // where: { createdBy: createdBy.id },
      limit: objPage.size,
      offset: (objPage.number - 1) * objPage.size,
      order,
      include: [
        {
          model: db.TourismService,
          attributes: ["service"],
          required: false,
        },
      ],
      attributes: [
        "id",
        "categoryId",
        "name",
        "description",
        "address",
        "phone",
        [col("imageUri"), "image"],
        [col("siteUri"), "url"],
        "geolocation",
      ],
    });

    // if (companiesInDb.count <= 0)
    //   throw {
    //     status: StatusCodes.NOT_FOUND,
    //     message: "There are not companies registered",
    //   };
    // if (companiesInDb.rows.length <= 0)
    //   throw {
    //     status: StatusCodes.BAD_REQUEST,
    //     message: '"page.number" is too large for the number of possible pages',
    //   };

    const transformedCompanies = companiesInDb.rows.map((point) => {
      const companyData = point.get({ plain: true });
      if (companyData.phone != null) {
        companyData.phone = String(companyData.phone).replace("+57", "");
      }
      companyData.services = companyData.TourismServices.map(item => item.service);
      delete companyData.TourismServices;
      companyData.lat = companyData.geolocation.coordinates[1];
      companyData.lon = companyData.geolocation.coordinates[0];
      delete companyData.geolocation;
      return companyData;
    });

    return res.status(StatusCodes.OK).json(transformedCompanies);
  } catch (error) {
    // console.error("companies could not be recovered: ", error.message);
    return next(error);
  }
};
