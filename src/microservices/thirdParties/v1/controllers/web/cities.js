const { StatusCodes } = require("http-status-codes");
const xlsx = require("node-xlsx");
const db = require("../../../../../models/index");
const validator = require("../../../utils/validators/web/cities.js");
const { Op, Sequelize } = require("sequelize");

/**
 * Create a city
 * @param {object} req - Object containing the city, cityCode, state
 * @return {object} Response contains: statuscode (integer), json (objeto): echo reply, if 200OK. Or if there's error, json (objeto): status, code, detail
 */
exports.postRegister = async (req, res, next) => {
  try {
    const { city, cityCode, state } = await validator.vWebPostRegister(req.body);

    const dataQuery = {
      city,
      cityCode,
      state,
    };

    const result = await db.City.create(dataQuery);
    delete result.dataValues.deletedAt;
    return res.status(StatusCodes.CREATED).json({ meta: null, data: result });
  } catch (error) {
    // console.error("City could not be created: ", error.message);
    return next(error);
  }
};

/**
 * Update a city
 * @param {object} req - Object containing the id, city, cityCode, state
 * @return {object} Response contains: statuscode (integer), json (City object updated) if 200OK. Or if there's error, json (objeto): status, code, detail
 */
exports.postEdit = async (req, res, next) => {
  try {
    const { id, city, cityCode, state } = await validator.vWebPostEdit(
      req.body
    );

    const dataQuery = {
      id,
      city,
      cityCode,
      state,
    };

    const cityInDb = await db.City.findByPk(id);

    if (cityInDb === null) {
      throw {
        status: StatusCodes.NOT_FOUND,
        message: `City does not exist`,
      };
    }

    const resultUpdate = await cityInDb.update(dataQuery);
    delete resultUpdate.dataValues.deletedAt;
    return res.status(StatusCodes.OK).json({
      meta: null,
      data: resultUpdate,
    });
  } catch (error) {
    // console.error("City could not be updated: ", error.message);
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
 * Get all  Cities
 * @return {object} Response contains: statuscode (integer), json (objeto): data Cities. Or if there's error, json (objeto): status, code, detail
 */
exports.getAll = async (req, res, next) => {
  try {
    const objPage = await validator.vWebGetAll({
      number: req.query.page ? parseInt(req.query.page.number) : null,
      size: req.query.page ? parseInt(req.query.page.size) : null,
    });

    const citiesInDb = await db.City.findAndCountAll({
      limit: objPage.size,
      offset: (objPage.number - 1) * objPage.size,
      order: [["city", "ASC"]],
      attributes: {
        exclude: ["deletedAt"],
      },
    });

    if (citiesInDb.count <= 0) {
      throw {
        status: StatusCodes.NOT_FOUND,
        message: "There are no cities registered in the database",
      };
    }
    if (citiesInDb.rows.length <= 0) {
      throw {
        status: StatusCodes.BAD_REQUEST,
        message: '"page.number" is too large for the number of possible pages',
      };
    }
    const totalPages = Math.ceil(citiesInDb.count / objPage.size);

    const responseCustom = {
      meta: {
        page: objPage.number,
        pageSize: objPage.size,
        totalRecords: citiesInDb.count,
        totalPages: totalPages,
      },
      data: citiesInDb.rows,
    };

    return res.status(StatusCodes.OK).send(responseCustom);
  } catch (error) {
    // console.error("Cities could not be recovered: ", error.message);
    return next(error);
  }
};

/**
 * Get list - autocomplete
 * @return {object} Response contains: statuscode (integer), json (objeto): data Cities. Or if there's error, json (objeto): status, code, detail
 */
exports.getAutocomplete = async (req, res, next) => {
  try {
    const objPage = await validator.vWebGetAutocomplete({
      q: req.query.q ? req.query.q : undefined,
      number: req.query.page ? parseInt(req.query.page.number) : null,
      size: req.query.page ? parseInt(req.query.page.size) : null,
    });

    const citiesInDb = await db.City.findAndCountAll({
      // where: Sequelize.where(Sequelize.fn("LOWER", Sequelize.col("city")), {
      //   [Op.like]: "%" + objPage.q + "%",
      // }),
      where: Sequelize.where(Sequelize.fn("unaccent", Sequelize.col("city")), {
        [Op.iLike]: "%" + objPage.q + "%",
      }),
      limit: objPage.size,
      offset: (objPage.number - 1) * objPage.size,
      order: [["city", "ASC"]],
      attributes: {
        exclude: ["deletedAt"],
      },
    });
    // SELECT * FROM "nameTable" WHERE unaccent(LOWER(nameCol)) LIKE unaccent(LOWER('query')) || '%';

    if (citiesInDb.count <= 0) {
      throw {
        status: StatusCodes.NOT_FOUND,
        message: "Cities not found",
      };
    }
    if (citiesInDb.rows.length <= 0) {
      throw {
        status: StatusCodes.BAD_REQUEST,
        message: '"page.number" is too large for the number of possible pages',
      };
    }
    const totalPages = Math.ceil(citiesInDb.count / objPage.size);

    const responseCustom = {
      meta: {
        page: objPage.number,
        pageSize: objPage.size,
        totalRecords: citiesInDb.count,
        totalPages: totalPages,
      },
      data: citiesInDb.rows,
    };

    return res.status(StatusCodes.OK).send(responseCustom);
  } catch (error) {
    // console.error("Cities could not be recovered: ", error.message);
    return next(error);
  }
};

/**
 * Destroy a City (soft delete)
 * @return {object} Response contains: statuscode (integer), json (objeto): id. Or if there's error, json (objeto): status, code, detail
 */
exports.postDelete = async (req, res, next) => {
  try {
    const { id } = await validator.vWebPostDelete(req.body);
    const citiesInDb = await db.City.findByPk(id, {
      include: [
        {
          model: db.TransportRoute,
          as: "originName",
          attributes: ["origin"],
        },
        {
          model: db.TransportRoute,
          as: "destinationName",
          attributes: ["destination"],
        },
      ],
      attributes: ["id"],
      paranoid: true,
    });

    if (citiesInDb === null) {
      throw {
        status: StatusCodes.NOT_FOUND,
        message: `City does not exist`,
      };
    }

    if (
      citiesInDb.originName.length != 0 &&
      citiesInDb.destinationName.length != 0
    )
      throw {
        status: StatusCodes.UNPROCESSABLE_ENTITY,
        message: `City has related transport routes`,
      };

    await citiesInDb.destroy();

    return res.status(StatusCodes.OK).json({
      meta: null,
      data: { id },
    });
  } catch (error) {
    // console.error("City could not be deleted: ", error.message);
    return next(error);
  }
};

/**
 * Upload an excel file that will create/update transport routes in the database. This use "Plantilla_Registro_Rutas_de_Transporte.xlsx". With: cityCode, destinationCode, duration, city, state, tariff
 * @return {object} Response contains: statuscode (integer), json (objeto): meta n data (array of successful and unsuccessful rows). Or if there's error, json (objeto): status, code, detail
 */
exports.postUploadXlsx = async (req, res, next) => {
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

    const xlsxFile = await validator.vMulterMemorySingleItemSchema(req.file);

    const contents = xlsx.parse(xlsxFile.buffer);
    let success = [];
    let errors = [];

    // Only one sheet is allowed in the xls
    const namePages = await validator.vExcelPagesSchema(contents);
    // city/municipality code, state name, city/municipality name

    // Validation of the first row of each sheet - name of the columns
    // for (let iPage = 0; iPage < namePages.length; iPage++) {
    // Validate column names
    // await validator.vExcelHeaderSchema({ header: contents[iPage].data[0] });
    // }

    const iPage = 0;
    let endRow = contents[iPage].data.length;

    for (let row = 1; row < contents[iPage].data.length; row++) {
      let item = contents[iPage].data[row].slice(0, 4).toString();
      // const transaction = await db.sequelize.transaction();

      // Check if there are no more data
      try {
        if (
          (contents[iPage].data[row][0] === "" &&
            contents[iPage].data[row][1] === "" &&
            contents[iPage].data[row][2] === "") ||
          (contents[iPage].data[row][0] === null &&
            contents[iPage].data[row][1] === null &&
            contents[iPage].data[row][2] === null) ||
          (contents[iPage].data[row][0] === undefined &&
            contents[iPage].data[row][1] === undefined &&
            contents[iPage].data[row][2] === undefined)
        ) {
          endRow = row;
          // await transaction.rollback();
          break;
        }

        let cityCode = null,
          city = null,
          state = null;

        try {
          ({ cityCode, city, state } =
            await validator.vExcelCitySchema({
              cityCode: parseInt(contents[iPage].data[row][0]),
              state: contents[iPage].data[row][1],
              city: contents[iPage].data[row][2],
            }));
        } catch (error) {
          errors.push(`Row ${row + 1} - [${item}]. Error ${error.message}.`);
          // await transaction.rollback();
          continue;
        }

        const cityInDb = await db.City.findOne({
          // // ! Pendiente: Validar permisos del usuario
          where: { cityCode },
          attributes: ["id", "city", "state"],
        });

        if (cityInDb === null) {
          await db.City.create({city, cityCode, state }
            // { transaction }
          );
          // await transaction.rollback();
          // success.push(`Row ${row + 1} - [${item}]. Created.`);
          continue;
        }

        // await transaction.commit();        
        // -------------------------- End Row
      } catch (error) {
        // await transaction.rollback();
        errors.push(`Row ${row + 1} - [${item}]. Server error.`);
        continue;
      }
    } // End for - End Excel rows

    let resJSON = {
      meta: {
        page: 1,
        // pageSize: resJSON.routes.length,
        // totalRecords: resJSON.routes.length,
        totalPages: 1,
        numRows: endRow - 1,
        numErrors: errors.length,
        numSuccess: endRow - 1 - errors.length,
      },
      data: {
        // success,
        errors,
      },
    };
    return res.status(StatusCodes.CREATED).json(resJSON);
  } catch (error) {
    return next(error);
  }
};
