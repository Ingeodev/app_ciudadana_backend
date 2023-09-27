const { StatusCodes } = require("http-status-codes");

const db = require("../../../../../models/index");
const validator = require("../../../utils/validators/mobile/tourismCategories");
const { formatColorOutputForMobile } = require("../../../../../utils/mobileColorFormatter");

/** List all the tourism categories in the mobile format */
const getAll = async (req, res, next) => {
  try {
    const { page } = await validator.validateOptionalPaginationSchema(req.query);
    const pagination = {
      number: 1,
      size: 500,
      ...page,
    };
    const offset = (pagination.number - 1) * pagination.size;
    const pageTourCats = await db.TourismCategory.findAll({
      paranoid: true,
      order: [["createdAt", "DESC"]],
      offset,
      limit: pagination.size,
      attributes: ['id', 'name', 'color', 'icon', 'iconMap'],
    });

    const data = pageTourCats.map(row => {
      const returnData = {
        id: row.dataValues.id,
        name: row.dataValues.name,
        color: formatColorOutputForMobile(row.dataValues.color),
        icon: row.dataValues.icon,
        iconMap: row.dataValues.iconMap,
      }
      return returnData;
    });
    return res.status(StatusCodes.OK).json(data);
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  getAll
};