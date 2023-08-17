const { StatusCodes } = require("http-status-codes");
const { Sequelize } = require('sequelize');


const validator = require("../../utils/validatorSocialNetwork");
const db = require("../../../../models/index");

const isAvailableSocialNetwork = async (socialNetworkTypeId, actualId) => {
  const socialNetwork = await db.SocialNetwork.findOne({
    where: {  socialNetworkTypeId: socialNetworkTypeId }
  });
  if (socialNetwork == null || socialNetwork == undefined) {
    return true;
  } 
  if(actualId == null) {
    return false;
  }
  if (actualId == socialNetwork.id) {
    return true;
  }
  return false;
}


const registerSocialNetwork = async (req, res, next) => {
    try {
        const { socialNetworkTypeId, url, icon } = await validator.vWebPostRegister(req.body);
        const isAvailable = await isAvailableSocialNetwork(socialNetworkTypeId, null);
        if (!isAvailable) {
          throw {
            status: StatusCodes.BAD_REQUEST,
            message: `The requested SocialNetworkType with id ${socialNetworkTypeId} does not available.`
        };
        }
        const newSocialNetwork = await db.SocialNetwork.create({
            socialNetworkTypeId,
            url,
            icon,
        });
        return res.status(StatusCodes.CREATED)
            .json({ data: { ...newSocialNetwork.dataValues, deletedAt: undefined } });
    } catch (error) {
        return next(error);
    }
};

const updateSocialNetwork = async (req, res, next) => {
    try {
        const update = await validator.vWebPostUpdate(req.body);
        const socialNetwork = await db.SocialNetwork.findByPk(update.id);
        const isAvailable = await isAvailableSocialNetwork(update.socialNetworkTypeId, update.id);
        if (!isAvailable) {
          throw {
            status: StatusCodes.BAD_REQUEST,
            message: `The requested SocialNetworkType with id ${update.socialNetworkTypeId} does not available.`
        }
        }
        if (socialNetwork == null)
            throw {
                status: StatusCodes.NOT_FOUND,
                message: `The requested SocialNetwork with id ${update.id} does not exist.`
            };
        delete update.id;
        const updatedSocialNetwork = await socialNetwork.update(update);
        return res.status(StatusCodes.OK)
            .json({ data: { ...updatedSocialNetwork.dataValues, deletedAt: undefined } });
    } catch (error) {
        return next(error);
    }
};

const changeStatusSocialNetwork = async (req, res, next) => {
    try {
        const { id, active } = await validator.vWebPostStatus(req.body);
        const socialNetwork = await db.SocialNetwork.findByPk(id);
        if (socialNetwork == null)
            throw {
                status: StatusCodes.NOT_FOUND,
                message: `The requested SocialNetwork with id ${id} does not exist.`
            };
        const updatedSocialNetwork = await socialNetwork.update({ active });
        return res.status(StatusCodes.OK)
            .json({ data: { ...updatedSocialNetwork.dataValues, deletedAt: undefined } });
    } catch (error) {
        return next(error);
    }
};

const deleteSocialNetwork = async (req, res, next) => {
    try {
        const { id } = await validator.vWebPostDelete(req.body);
        const socialNetwork = await db.SocialNetwork.findByPk(id);
        if (socialNetwork == null)
            throw {
                status: StatusCodes.NOT_FOUND,
                message: `The requested SocialNetwork with id ${id} has already been deleted.`
            };
        await socialNetwork.destroy();
        return res.status(StatusCodes.OK).json({
            data: { id }
        });
    } catch (error) {
        return next(error);
    }
};

const listSocialNetworks = async (req, res, next) => {
    try {
        const objPage = await validator.vWebGetListAll({
          number: req.query.page ? parseInt(req.query.page.number) : null,
          size: req.query.page ? parseInt(req.query.page.size) : null,
        });
        const socialNetworksInDb = await db.SocialNetwork.findAndCountAll({
            unique: true,
            paranoid: true,
            order: [["createdAt", "DESC"]],
            limit: objPage.size,
            offset: (objPage.number - 1) * objPage.size,
            include: [{
                model: db.SocialNetworkType,
                attributes: ['name', 'code'],
                required: false,
            }],
            attributes: {
                exclude: ["deletedAt"],
                include: [
                    [Sequelize.col('"SocialNetworkType"."name"'), 'social_name'],
                    [Sequelize.col('"SocialNetworkType"."code"'), 'type']
                ],
            },
        });
    
        if (socialNetworksInDb.count <= 0) {
          throw {
            status: StatusCodes.NOT_FOUND,
            message: "There are no social networks registered in the database",
          };
        }
        if (socialNetworksInDb.rows.length <= 0) {
          throw {
            status: StatusCodes.BAD_REQUEST,
            message: '"page.number" is too large for the number of possible pages',
          };
        }
        const totalPages = Math.ceil(socialNetworksInDb.count / objPage.size);
    
        const responseCustom = {
          meta: {
            page: objPage.number,
            pageSize: objPage.size,
            totalRecords: socialNetworksInDb.count,
            totalPages: totalPages,
          },
          data: socialNetworksInDb.rows,
        };
    
        return res.status(StatusCodes.OK).send(responseCustom);
      } catch (error) {
        console.error("social network types could not be recovered: ", error.message);
        return next(error);
      }
};

const listSocialNetworkTypes = async (req, res, next) => {
    try {
      console.log(db)
        const socialNetworkTypeInDb = await db.SocialNetworkType.findAndCountAll({
            unique: true,
            paranoid: true,
            order: [["createdAt", "DESC"]],
        });
    
        if (socialNetworkTypeInDb.count <= 0) {
          throw {
            status: StatusCodes.NOT_FOUND,
            message: "There are no social network types registered in the database",
          };
        }
        if (socialNetworkTypeInDb.rows.length <= 0) {
          throw {
            status: StatusCodes.BAD_REQUEST,
            message: '"page.number" is too large for the number of possible pages',
          };
        }
    
        const responseCustom = {
          meta: {},
          data: socialNetworkTypeInDb.rows,
        };
    
        return res.status(StatusCodes.OK).send(responseCustom);
      } catch (error) {
        console.error("social networks types could not be recovered: ", error.message);
        return next(error);
      }
}

module.exports = {
    registerSocialNetwork,
    updateSocialNetwork,
    changeStatusSocialNetwork,
    deleteSocialNetwork,
    listSocialNetworks,
    listSocialNetworkTypes
};
