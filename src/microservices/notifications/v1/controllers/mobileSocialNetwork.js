const { StatusCodes } = require("http-status-codes");

const db = require("../../../../models/index");
const { Sequelize } = require('sequelize');


const getSocialNetworks = async (req, res, next) => {
  try {

    const socialNetworksInDb = await db.SocialNetwork.findAll({
      include: [{
        model: db.SocialNetworkType,
        attributes: ['name', 'code'],
        required: false,
    }],
      attributes: [[Sequelize.col('"SocialNetworkType"."code"'), 'type'], "url", "icon"],
      order: [["createdAt", "DESC"]], // Sort by date of creation in descending order
    });

    return res.status(StatusCodes.OK).send(socialNetworksInDb);
  } catch (error) {
    console.error("social networks could not be recovered: ", error.message);
    return next(error);
  }
};

module.exports = {
    getSocialNetworks
};
