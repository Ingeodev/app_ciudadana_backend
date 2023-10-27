const { StatusCodes } = require("http-status-codes");

const validator = require("../../utils/validatorMobileService");
const db = require("../../../../models/index");

const isAvailableMobileService = async (route, accessLevel, actualId) => {
  const MobileService = await db.MobileService.findOne({
    where: { route: route, accessLevel: accessLevel }
  });
  if (MobileService == null || MobileService == undefined) {
    return true;
  }
  if (actualId == null) {
    return false;
  }
  if (actualId == MobileService.id) {
    return true;
  }
  return false;
}


const registerMobileService = async (req, res, next) => {
  try {
    const { route, name, subtitle, imageUri, icon, accessLevel } = await validator.vWebPostRegister(req.body);
    const isAvailable = await isAvailableMobileService(route, accessLevel, null);
    if (!isAvailable) {
      throw {
        status: StatusCodes.BAD_REQUEST,
        message: `The requested route with  ${route} and ${accessLevel} does not available.`
      };
    }
    const newMobileService = await db.MobileService.create({
      route, name, subtitle, imageUri, icon, accessLevel
    });
    return res.status(StatusCodes.CREATED)
      .json({ data: { ...newMobileService.dataValues, deletedAt: undefined } });
  } catch (error) {
    return next(error);
  }
};

const updateMobileService = async (req, res, next) => {
  try {
    const update = await validator.vWebPostUpdate(req.body);
    const MobileService = await db.MobileService.findByPk(update.id);
    const isAvailable = await isAvailableMobileService(update.route, update.accessLevel, update.id);
    if (!isAvailable) {
      throw {
        status: StatusCodes.BAD_REQUEST,
        message: `The requested MobileServiceType with id ${update.accessLevel} does not available.`
      }
    }
    if (MobileService == null)
      throw {
        status: StatusCodes.NOT_FOUND,
        message: `The requested MobileService with id ${update.id} does not exist.`
      };
    delete update.id;
    const updatedMobileService = await MobileService.update(update);
    return res.status(StatusCodes.OK)
      .json({ data: { ...updatedMobileService.dataValues, deletedAt: undefined } });
  } catch (error) {
    return next(error);
  }
};

const changeStatusMobileService = async (req, res, next) => {
  try {
    const { id, active } = await validator.vWebPostStatus(req.body);
    const MobileService = await db.MobileService.findByPk(id);
    if (MobileService == null)
      throw {
        status: StatusCodes.NOT_FOUND,
        message: `The requested MobileService with id ${id} does not exist.`
      };
    const updatedMobileService = await MobileService.update({ active });
    return res.status(StatusCodes.OK)
      .json({ data: { ...updatedMobileService.dataValues, deletedAt: undefined } });
  } catch (error) {
    return next(error);
  }
};

const deleteMobileService = async (req, res, next) => {
  try {
    const { id } = await validator.vWebPostDelete(req.body);
    const MobileService = await db.MobileService.findByPk(id, {
      include: [
        {
          model: db.Advertisement,
          attributes: ["id"],
          required: false,
        },
      ],
      attributes: ["id"],
      paranoid: true,
    });
    
    if (MobileService === null) {
      throw {
        status: StatusCodes.NOT_FOUND,
        message: `The requested MobileService with id ${id} has already been deleted.`,
      };
    }

    if (MobileService.Advertisements != 0)
      throw {
        status: StatusCodes.UNPROCESSABLE_ENTITY,
        message: `The mobile service has active records associated.`,
      };
    
    await MobileService.destroy();
    return res.status(StatusCodes.OK).json({
      data: { id }
    });
  } catch (error) {
    return next(error);
  }
};

const listMobileServices = async (req, res, next) => {
  try {
    const objPage = await validator.vWebGetListAll({
      number: req.query.page ? parseInt(req.query.page.number) : null,
      size: req.query.page ? parseInt(req.query.page.size) : null,
    });
    const socialNetworksInDb = await db.MobileService.findAndCountAll({
      unique: true,
      paranoid: true,
      order: [["createdAt", "DESC"]],
      limit: objPage.size,
      offset: (objPage.number - 1) * objPage.size,
      attributes: {
        exclude: ["deletedAt"]
      },
    });
    let message = undefined;
    if (socialNetworksInDb.count <= 0)
      message = 'There are no Mobile Services registered in the database.';
    if (socialNetworksInDb.rows.length <= 0)
      message = '"page[number]" is too large for the number of possible pages.';

    const totalPages = Math.ceil(socialNetworksInDb.count / objPage.size);

    const responseCustom = {
      meta: {
        message,
        page: objPage.number,
        pageSize: objPage.size,
        totalRecords: socialNetworksInDb.count,
        totalPages: totalPages,
      },
      data: socialNetworksInDb.rows,
    };

    return res.status(StatusCodes.OK).send(responseCustom);
  } catch (error) {
    console.error("Mobile service types could not be recovered: ", error.message);
    return next(error);
  }
};

const listMobileServiceTypes = (req, res, next) => {
  try {
    const defaultTypes = ["notRegistered", "baseLogin", "fullLogin"];

    const responseCustom = {
      meta: {},
      data: defaultTypes
    };

    return res.status(StatusCodes.OK).send(responseCustom);
  } catch (error) {
    console.error("mobile services types could not be recovered: ", error.message);
    return next(error);
  }
}

module.exports = {
  registerMobileService,
  updateMobileService,
  changeStatusMobileService,
  deleteMobileService,
  listMobileServices,
  listMobileServiceTypes
};
