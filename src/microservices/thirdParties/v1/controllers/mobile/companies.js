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
      number: req.query.page ? parseInt(req.query.page.number) : 1,
      size: req.query.page ? parseInt(req.query.page.size) : 100,
    });

    const companiesInDb = await db.ThirdPartyCompany.findAndCountAll({
      // // ! Pendiente: Validar permisos del usuario
      // where: { createdBy: createdBy.id },
      limit: objPage.size,
      offset: (objPage.number - 1) * objPage.size,
      order: [["createdAt", "DESC"]], // Sort by date of creation in descending order
      include: [
        {
          model: db.ThirdPartyCategory,
          attributes: ["name"],
          required: false,
        },
        {
          model: db.ThirdPartyService,
          attributes: ["id", "service", "companyId", "createdAt", "updatedAt"],
          required: false,
        },
      ],
      attributes: {
        exclude: ["createdBy", "geolocation", "deletedAt"],
        // include: [
        //   [Sequelize.col('"ThirdPartyCategory"."name"'), "categoryName"],
        // ],
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
      const companyData = company.get({ plain: true }); // Convertir instancia de Sequelize a objeto simple
      const categoryName = companyData.ThirdPartyCategory.name;
      delete companyData.ThirdPartyCategory; // Eliminar el objeto ThirdPartyCategory
      const services = companyData.ThirdPartyServices;
      delete companyData.ThirdPartyServices; // Eliminar el objeto ThirdPartyServices

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
