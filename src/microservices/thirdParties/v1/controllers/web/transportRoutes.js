const { StatusCodes } = require("http-status-codes");
const xlsx = require("node-xlsx");
const db = require("../../../../../models/index.js");
const validator = require("../../../utils/validators/web/transportRoutes.js");

/**
 * Create an transport route
 * @param {Array} req.body - Object containing the origin, destination, companyId
 * @return {object} Response contains: statuscode (integer), json (objects array): id, origin, destination, companyId, if 200OK. Or if there's error, json (object): status, code, detail
 */
exports.postRegister = async (req, res, next) => {
  try {
    // // ! Pendiente: Validar permisos del usuario
    // const createdBy = await db.User.findOne({
    //   where: { disabled: false, userMobile: false, clientId: res.locals.uid },
    //   attributes: ["id"],
    // });f

    // if (createdBy == null || createdBy.id == null)
    //   throw {
    //     message: "User not found.",
    //     status: StatusCodes.NOT_FOUND,
    //   };

    const { origin, destination, companyId } = await validator.vWebPostRegister(
      req.body
    );

    // First, validate that the transport company belongs to the user.
    const company = await db.TransportCompany.findOne({
      where: {
        id: companyId,
        // createdBy: createdBy.id,
      },
      attributes: ["id"],
    });

    if (company == null || company.id == null)
      throw {
        message: "The transport company not found",
        status: StatusCodes.NOT_FOUND,
        // status: StatusCodes.FORBIDDEN,
      };

    const dataQuery = {
      origin,
      destination,
      companyId,
    };

    const result = await db.TransportRoute.create(dataQuery);
    delete result.dataValues.deletedAt;
    return res.status(StatusCodes.CREATED).json({ meta: null, data: result });
  } catch (error) {
    // console.error("The transport route could not be created: ", error.message);
    return next(error);
  }
};

/**
 * Update a transport route
 * @param {object} req - Object containing the id, origin, destination, companyId
 * @return {object} Response contains: statuscode (integer), json (route object updated) if 200OK. Or if there's error, json (object): status, code, detail
 */
exports.postEdit = async (req, res, next) => {
  try {
    // // ! Pendiente: Validar permisos del usuario
    // const createdBy = await db.User.findOne({
    //   where: { disabled: false, userMobile: false, clientId: res.locals.uid },
    //   attributes: ["id"],
    // });

    // if (createdBy == null || createdBy.id == null)
    //   throw {
    //     message: "User not found.",
    //     status: StatusCodes.NOT_FOUND,
    //   };

    const { id, origin, destination, companyId } = await validator.vWebPostEdit(
      req.body
    );

    // First, validate that the transport company belongs to the user.
    const companyInDb = await db.TransportCompany.findOne({
      where: {
        id: companyId,
        // createdBy: createdBy.id,
      },
      attributes: ["id"],
    });

    if (companyInDb == null || companyInDb.id == null)
      throw {
        message: "The transport company not found",
        status: StatusCodes.NOT_FOUND,
        // status: StatusCodes.FORBIDDEN,
      };

    // Validate that the route belongs to the user
    const routeInDb = await db.TransportRoute.findOne({
      where: {
        id,
        companyId: companyInDb.id,
      },
    });

    if (routeInDb == null)
      throw {
        message: "Transport route not found",
        status: StatusCodes.NOT_FOUND,
        // status: StatusCodes.UNPROCESSABLE_ENTITY,
      };

    // const routeInDb = await db.ThirdPartyCategory.findByPk(id);

    const resultUpdate = await routeInDb.update({ origin, destination });
    delete resultUpdate.dataValues.deletedAt;

    return res.status(StatusCodes.OK).json({ meta: null, data: resultUpdate });
  } catch (error) {
    // console.error("ThirdParty categories could not be updated: ", error.message);
    if (
      error &&
      error.errors &&
      error.errors.length > 0 &&
      error.errors[0].message
    ) {
      error.message = error.errors[0].message;
    }
    return next(error);
  }
};

/**
 * Destroy a transport route (soft delete)
 * @param {object} req - Object containing the id, companyId
 * @return {object} Response contains: statuscode (integer), json (object): id. Or if there's error, json (object): status, code, detail
 */
exports.postDelete = async (req, res, next) => {
  try {
    // // ! Pendiente: Validar permisos del usuario
    // const createdBy = await db.User.findOne({
    //   where: { disabled: false, userMobile: false, clientId: res.locals.uid },
    //   attributes: ["id"],
    // });

    // if (createdBy == null || createdBy.id == null)
    //   throw {
    //     message: "User not found.",
    //     status: StatusCodes.NOT_FOUND,
    //   };

    const { id, companyId } = await validator.vWebPostDelete(req.body);

    // First, validate that the transport company belongs to the user.
    const companyInDb = await db.TransportCompany.findOne({
      where: {
        id: companyId,
        // createdBy: createdBy.id,
      },
      attributes: ["id"],
    });

    if (companyInDb == null || companyInDb.id == null)
      throw {
        message: "The transport company not found",
        status: StatusCodes.NOT_FOUND,
        // status: StatusCodes.FORBIDDEN,
      };

    // Validate that the route belongs to the transport company
    const routeInDb = await db.TransportRoute.findOne({
      where: {
        id,
        companyId: companyInDb.id,
      },
    });

    if (routeInDb == null)
      throw {
        message: "Transport route not found",
        status: StatusCodes.NOT_FOUND,
        // status: StatusCodes.UNPROCESSABLE_ENTITY,
      };

    await routeInDb.destroy();

    return res.status(StatusCodes.OK).json({
      meta: null,
      data: { id, companyId },
    });
  } catch (error) {
    // console.error("ThirdParty categories could not be deleted: ", error.message);
    return next(error);
  }
};

/**
 * Get all transport routes of an company
 * @param {object} req.query - Object containing the number and size
 * @return {object} Response contains: statuscode (integer), json (objeto): data transport companies. Or if there's error, json (objeto): status, code, detail
 */
exports.getAll = async (req, res, next) => {
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

    const objPage = await validator.vWebGetListRoutes({
      companyId: req.query.companyId,
      number: req.query.page ? parseInt(req.query.page.number) : null,
      size: req.query.page ? parseInt(req.query.page.size) : null,
    });

    const companiesInDb = await db.TransportRoute.findAndCountAll({
      // // ! Pendiente: Validar permisos del usuario
      where: {
        companyId,
      },
      limit: objPage.size,
      offset: (objPage.number - 1) * objPage.size,
      order: [["origin", "ASC"]], // Sort by date of creation in descending order
      attributes: {
        exclude: ["deletedAt"],
      },
    });

    if (companiesInDb.count <= 0)
      throw {
        status: StatusCodes.NOT_FOUND,
        message: "There are not transport routes registered",
      };
    if (companiesInDb.rows.length <= 0)
      throw {
        status: StatusCodes.BAD_REQUEST,
        message: '"page.number" is too large for the number of possible pages',
      };
    const totalPages = Math.ceil(companiesInDb.count / objPage.size);

    const responseCustom = {
      meta: {
        page: objPage.number,
        pageSize: objPage.size,
        totalRecords: companiesInDb.count,
        totalPages: totalPages,
      },
      data: companiesInDb.rows,
    };

    return res.status(StatusCodes.OK).send(responseCustom);
  } catch (error) {
    // console.error("Transport routes could not be recovered: ", error.message);
    return next(error);
  }
};

/**
 * Get all transport companies with your routes
 * @param {object} req.query - Object containing the number and size
 * @return {object} Response contains: statuscode (integer), json (objeto): data transport companies. Or if there's error, json (objeto): status, code, detail
 */
exports.getCompaniesNRoutes = async (req, res, next) => {
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

    const objPage = await validator.vWebGetListCompaniesNRoutes({
      number: req.query.page ? parseInt(req.query.page.number) : null,
      size: req.query.page ? parseInt(req.query.page.size) : null,
    });

    const companiesInDb = await db.TransportCompany.findAndCountAll({
      // // ! Pendiente: Validar permisos del usuario
      // where: { createdBy: createdBy.id },
      limit: objPage.size,
      offset: (objPage.number - 1) * objPage.size,
      order: [["name", "ASC"]], // Sort by date of creation in descending order
      include: [
        {
          model: db.TransportRoute,
          attributes: ["id", "origin", "destination"],
          required: false,
        },
      ],
      attributes: {
        exclude: [
          "createdBy",
          "createdAt",
          "updatedAt",
          "deletedAt",
          // "imageUri",
        ],
        include: [
          "id",
          "name",
          "nit",
          "description",
          "phone",
          "siteUri",
          "imageUri",
          // ["imageUri", "image"],
          // [db.Sequelize.col("imageUri"), "image"],
        ],
      },
    });

    if (companiesInDb.count <= 0)
      throw {
        status: StatusCodes.NOT_FOUND,
        message: "There are not transport companies registered",
      };
    if (companiesInDb.rows.length <= 0)
      throw {
        status: StatusCodes.BAD_REQUEST,
        message: '"page.number" is too large for the number of possible pages',
      };
    const totalPages = Math.ceil(companiesInDb.count / objPage.size);

    const transformedCompanies = companiesInDb.rows.map((company) => {
      const companyData = company.get({ plain: true }); // Convert Sequelize instance to simple object
      const routes = companyData.TransportRoutes.map(
        (obj) => obj.id,
        obj.origin,
        obj.destination
      );
      delete companyData.TransportRoutes;

      return {
        ...companyData,
        routes,
      };
    });

    const responseCustom = {
      meta: {
        page: objPage.number,
        pageSize: objPage.size,
        totalRecords: companiesInDb.count,
        totalPages: totalPages,
      },
      data: transformedCompanies,
    };

    return res.status(StatusCodes.OK).send(responseCustom);
  } catch (error) {
    // console.error("Transport companies could not be recovered: ", error.message);
    return next(error);
  }
};

/**
 * Upload an excel file that will replace all existing transport routes in the database.
 * @param {object} req.file - Object containing the number and size
 * @return {object} Response contains: statuscode (integer), json (objeto): data transport companies. Or if there's error, json (objeto): status, code, detail
 */
exports.postUploadXlsxRoutes = async (req, res, next) => {
  try {

    const xlsxFile = await validator.vMulterMemorySingleItemSchema(req.file);
    const { companyId } = await validator.vWebPostUploadXlsxRoutes(req.body);

    let routes = [];
    let item = null;
    try {
      const contents = xlsx.parse(xlsxFile.buffer);
      const excelContents = await validator.vRoutesExcelContentsSchema(contents);
      for (let i = 1; i < excelContents[0].data.length; i++) {
        item = excelContents[0].data[i].toString();
        const route = await validator.vRouteSchema({
          id: excelContents[0].data[i][0],
          origin: excelContents[0].data[i][1],
          destination: excelContents[0].data[i][2],
          companyId
        });
        routes.push(route);
      }
    } catch (error) {
      let message = `The uploaded file is invalid: ${error.message}.`;
      if (error.status != null && item != null)
        message += `\n\tErronous item: [${item}].`;
      throw {
        status: StatusCodes.UNPROCESSABLE_ENTITY,
        message,
      };
    }
    const createdRoutes = await db.sequelize.transaction(
      async (transaction) => {
        await db.TransportRoute.destroy({
          where: { deletedAt: null },
          transaction,
        });
        const allRoutes = await db.TransportRoute.bulkCreate(routes, {
          fields: ["id", "origin", "destination", "companyId"],
          updateOnDuplicate: ["origin", "destination", "companyId", "updatedAt", "deletedAt"],
          validate: true,
          transaction,
        });
        return allRoutes;
      }
    );
    const returnRoutes = createdRoutes.map((obj) => {
      return { ...obj.dataValues, deletedAt: undefined };
    });
    return res.status(StatusCodes.CREATED).json({
      meta: {
        page: 1,
        pageSize: returnRoutes.length,
        totalRecords: returnRoutes.length,
        totalPages: 1,
      },
      data: returnRoutes,
    });
  } catch (error) {
    return next(error);
  }
};
