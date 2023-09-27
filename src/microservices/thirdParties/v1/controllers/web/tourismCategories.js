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
    return res.status(StatusCodes.OK).send({ ...createdTourCat.dataValues, deletedAt: undefined });
  } catch (error) {
    return next(error);
  }
};

/** List all tourism categories */
const getAll = async (req, res, next) => {
  try {
    return res.status(StatusCodes.OK).send({ meta: { msg: 'TODO: Implement' } });
  } catch (error) {
    return next(error);
  }
};

/** Update one tourism category */
const postUpdate = async (req, res, next) => {
  try {
    return res.status(StatusCodes.OK).send({ meta: { msg: 'TODO: Implement' } });
  } catch (error) {
    return next(error);
  }
};

/** Delete one tourism category */
const postDelete = async (req, res, next) => {
  try {
    return res.status(StatusCodes.OK).send({ meta: { msg: 'TODO: Implement' } });
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