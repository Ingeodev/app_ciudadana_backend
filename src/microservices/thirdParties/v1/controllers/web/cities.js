const { StatusCodes } = require("http-status-codes");
const { parse } = require("node-xlsx");
const { Op, where, fn, col } = require("sequelize");
const db = require("../../../../../models/index");
const validator = require("../../../utils/validators/web/cities.js");

/**
 * Create a city
 * @param {object} req.body - Object containing the city, cityCode, state
 * @return {object} Response contains: statusCode (integer), json (objeto): echo reply, if 200OK. Or if there's error, json (objeto): status, code, detail
 */
exports.postRegister = async (req, res, next) => {
  try {
    const { city, cityCode, state } = await validator.vWebPostRegister(req.body);

    const result = await db.City.create({
      city,
      cityCode,
      state,
    });
    delete result.dataValues.deletedAt;
    return res.status(StatusCodes.CREATED).json({ meta: null, data: result });
  } catch (error) {
    // console.error("City could not be created: ", error.message);
    if (error.name === "SequelizeUniqueConstraintError") {
      error.message = "The city has been previously created.";
      error.status = StatusCodes.BAD_REQUEST;
    }
    return next(error);
  }
};

/**
 * Update a city
 * @param {object} req.body - Object containing the id, city, cityCode, state
 * @return {object} Response contains: statusCode (integer), json (City object updated) if 200OK. Or if there's error, json (objeto): status, code, detail
 */
exports.postEdit = async (req, res, next) => {
  try {
    const { id, city, cityCode, state } = await validator.vWebPostEdit(
      req.body
    );

    const cityInDb = await db.City.findByPk(id);

    if (cityInDb === null) {
      throw {
        status: StatusCodes.NOT_FOUND,
        message: `City does not exist`,
      };
    }

    const resultUpdate = await cityInDb.update({
      id,
      city,
      cityCode,
      state,
    });
    delete resultUpdate.dataValues.deletedAt;
    return res.status(StatusCodes.OK).json({
      meta: null,
      data: resultUpdate,
    });
  } catch (error) {
    // console.error("City could not be updated: ", error.message);
    if (error.name === 'SequelizeUniqueConstraintError') {
      error.message = "City and State must be unique";
      error.status = StatusCodes.BAD_REQUEST;
    } else if (error && error.errors && error.errors.length > 0 && error.errors[0].message) {
      error.message = error.errors[0].message;
    }
    return next(error);
  }
};

/**
 * Get all  Cities
 * @param {object} req.query - Object containing the number, size
 * @return {object} Response contains: statusCode (integer), json (objeto): data Cities. Or if there's error, json (objeto): status, code, detail
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

    let message = undefined;
    if (citiesInDb.count <= 0)
      message = "There are no cities registered";
    if (citiesInDb.rows.length <= 0)
      message = '"page[number]" is too large for the number of possible pages.';

    return res.status(StatusCodes.OK).json({
      meta: {
        message,
        page: objPage.number,
        pageSize: objPage.size,
        totalRecords: citiesInDb.count,
        totalPages: Math.ceil(citiesInDb.count / objPage.size),
      },
      data: citiesInDb.rows,
    });
  } catch (error) {
    // console.error("Cities could not be recovered: ", error.message);
    return next(error);
  }
};

/**
 * Get list - autocomplete
 * @param {object} req.query - Object containing the number, size, q (string-query)
 * @return {object} Response contains: statusCode (integer), json (objeto): data Cities. Or if there's error, json (objeto): status, code, detail
 */
exports.getAutocomplete = async (req, res, next) => {
  try {
    const objPage = await validator.vWebGetAutocomplete({
      q: req.query.q ? req.query.q : undefined,
      number: req.query.page ? parseInt(req.query.page.number) : null,
      size: req.query.page ? parseInt(req.query.page.size) : null,
    });

    const citiesInDb = await db.City.findAndCountAll({
      // where: where(fn("LOWER", col("city")), {
      //   [Op.like]: "%" + objPage.q + "%",
      // }),
      where: where(fn("unaccent", col("city")), {
        [Op.iLike]: "%" + objPage.q + "%",
      }),
      limit: objPage.size,
      offset: (objPage.number - 1) * objPage.size,
      order: [["city", "ASC"]],
      attributes: ["id", "city", "cityCode", "state"]
    });

    let message = undefined;
    if (citiesInDb.count <= 0)
      message = "There are no cities registered";
    if (citiesInDb.rows.length <= 0)
      message = '"page[number]" is too large for the number of possible pages.';

    return res.status(StatusCodes.OK).json({
      meta: {
        message,
        page: objPage.number,
        pageSize: objPage.size,
        totalRecords: citiesInDb.count,
        totalPages: Math.ceil(citiesInDb.count / objPage.size),
      },
      data: citiesInDb.rows,
    });
  } catch (error) {
    // console.error("Cities could not be recovered: ", error.message);
    return next(error);
  }
};

/**
 * Destroy a City (soft delete)
 * @param {integer} req.body.id - id of City
 * @return {object} Response contains: statusCode (integer), json (objeto): id. Or if there's error, json (objeto): status, code, detail
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
 * Upload an excel file that will create/update transport routes in the database. This use "Codigos_municipios_DANE.xlsx". With: code of municipality, name of department, name of municipality
 * @param {file} req.file - file with the cities/municipalities to be create/update
 * @return {object} Response contains: statusCode (integer), json (objeto): meta n data (array of successful and unsuccessful rows). Or if there's error, json (objeto): status, code, detail
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

    const contents = parse(xlsxFile.buffer);
    let success = [];
    let errors = [];

    // Only one sheet is allowed in the xls
    const namePages = await validator.vExcelPagesSchema(contents);

    const iPage = 0;
    let endRow = contents[iPage].data.length;

    for (let row = 1; row < contents[iPage].data.length; row++) {
      let item = contents[iPage].data[row].slice(0, 4).toString();

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
          continue;
        }

        const cityInDb = await db.City.findOne({
          where: { cityCode },
          attributes: ["id", "city", "state"],
        });

        if (cityInDb === null) {
          await db.City.create({ city, cityCode, state });
          success.push(`Row ${row + 1} - [${item}]. The city has been created.`);
          continue;
        }
        cityInDb.update({ city, state });
        success.push(`Row ${row + 1} - [${item}]. The city has been updated.`);
        // -------------------------- End Row
      } catch (error) {
        errors.push(`Row ${row + 1} - [${item}]. The city could not be created.`);
        continue;
      }
    } // End for - End Excel rows

    let resJSON = {
      meta: {
        page: 1,
        totalPages: 1,
        numRows: endRow - 1,
        numErrors: errors.length,
        numSuccess: endRow - 1 - errors.length,
      },
      data: {
        success,
        errors,
      },
    };
    return res.status(StatusCodes.CREATED).json(resJSON);
  } catch (error) {
    return next(error);
  }
};
