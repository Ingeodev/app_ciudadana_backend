const { StatusCodes } = require("http-status-codes");

const db = require("../../../../../models/index");
const validator = require("../../../utils/validators/web/tourismCategories");

/** Create one tourism category */
const postCreate = async (req, res, next) => {
  try {
    // ! Pendiente: Validar permisos del usuario
    const adminUser = await db.User.findOne({
      where: { disabled: false, userMobile: false, clientId: res.locals.uid },
      attributes: ["id"],
    });
    if (adminUser == null || adminUser.id == null)
      throw {
        message: "Requesting user is not allowed to create tourism categories or is not registered in the database yet.",
        status: StatusCodes.FORBIDDEN,
      };
    const { name, color, icon, iconMap } = await validator.validateCreateTourCatSchema(req.body);
    const createdTourCat = await db.TourismCategory.create({ name, color, icon, iconMap, createdBy: adminUser.id });
    return res.status(StatusCodes.CREATED).send({ data: { ...createdTourCat.dataValues, deletedAt: undefined } });
  } catch (error) {
    return next(error);
  }
};

/** List all tourism categories */
const getAll = async (req, res, next) => {
  try {
    const { page: pagination } = await validator.validateSimplePaginationSchema(req.query);
    const offset = (pagination.number - 1) * pagination.size;
    const pageTourCats = await db.TourismCategory.findAndCountAll({
      paranoid: true,
      order: [["createdAt", "DESC"]],
      offset,
      limit: pagination.size,
      attributes: {
        exclude: ["deletedAt"],
      },
    });
    let message = undefined;
    if (pageTourCats.count <= 0)
      message = 'There are no Tourism Categories registered in the database.';
    if (pageTourCats.rows.length <= 0)
      message = '"page[number]" is too large for the number of possible pages.';
    const data = pageTourCats.rows.map(row => {
      return row.dataValues;
    });
    return res.status(StatusCodes.OK).json({
      meta: {
        message,
        page: pagination.number,
        pageSize: pagination.size,
        totalRecords: pageTourCats.count,
        totalPages: Math.ceil(pageTourCats.count / pagination.size),
      },
      data,
    });
  } catch (error) {
    return next(error);
  }
};

/** Update one tourism category */
const postUpdate = async (req, res, next) => {
  try {
    // ! Pendiente: Validar permisos del usuario
    const update = await validator.validateEditTourCatSchema(req.body);
    const originalTourCat = await db.TourismCategory.findByPk(update.id);
    if (originalTourCat == null)
      throw {
        status: StatusCodes.NOT_FOUND,
        message: `The requested Tourism Category with id ${update.id} does not exist.`
      };
    delete update.id;
    const updatedTourCat = await originalTourCat.update(update);
    return res.status(StatusCodes.OK).send({ data: { ...updatedTourCat.dataValues, deletedAt: undefined } });
  } catch (error) {
    return next(error);
  }
};

/** Delete one tourism category */
const postDelete = async (req, res, next) => {
  try {
    // ! Pendiente: Validar permisos del usuario
    const { id } = await validator.validateSimpleDeleteByIdSchema(req.body);
    const originalTourCat = await db.TourismCategory.findByPk(id, {
      include: [
        {
          model: db.TourismCompany,
          attributes: ["id"],
          required: false,
        },
      ],
      attributes: ["id"],
      paranoid: true,
    });
    if (originalTourCat == null)
      throw {
        status: StatusCodes.NOT_FOUND,
        message: `The requested Tourism Category with id ${id} has already been deleted.`
      };
    if (originalTourCat.TourismCompanies.length != 0)
      throw {
        status: StatusCodes.UNPROCESSABLE_ENTITY,
        message: "The Tourism Category has related Tourism Companies and cannot be deleted.",
      };
    await originalTourCat.destroy();
    return res.status(StatusCodes.OK).send({ data: { id } });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  getAll,
  postCreate,
  postUpdate,
  postDelete,
};