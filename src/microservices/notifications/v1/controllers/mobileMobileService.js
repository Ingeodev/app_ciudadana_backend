const { StatusCodes } = require("http-status-codes");

const db = require("../../../../models/index");
const { Sequelize } = require('sequelize');


const getMobileServices = async (req, res, next) => {
  try {

    const mobileServicesInDb = await db.MobileService.findAll({
      where: { active: false },
      attributes: ["route", "name", "subtitle", [Sequelize.col('imageUri'), 'image'], "icon", "accessLevel"],
      order: [["createdAt", "DESC"]],
    });

    return res.status(StatusCodes.OK).send(mobileServicesInDb);
  } catch (error) {
    console.error("mobile services could not be recovered: ", error.message);
    return next(error);
  }
};

module.exports = {
    getMobileServices
};
