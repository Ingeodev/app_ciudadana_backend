const { StatusCodes } = require("http-status-codes");
const { Sequelize } = require("sequelize");

const db = require("../../../../models/index.js");
const validator = require("../../utils/validator");
const {
  formatColorOutputForMobile,
} = require("../../../../utils/mobileColorFormatter");

// Retrieve the available security attention points.
const getSecurityAttentionPoints = async (req, res, next) => {
  try {
    const { lat, lon } = await validator.validateOptionalLocationSchema(
      req.query
    );
    let order = [["name", "ASC"]];
    if (
      lat != null &&
      lon != null &&
      typeof lat == "number" &&
      typeof lon == "number"
    ) {
      const pointObj = {
        type: "Point",
        coordinates: [lon, lat],
      };
      const geoPoint = Sequelize.fn(
        "ST_GeomFromGeoJSON",
        JSON.stringify(pointObj)
      );
      const distance = Sequelize.fn(
        "ST_Distance",
        Sequelize.col("geolocation"),
        geoPoint
      );
      order = [[distance, "ASC"]];
    }
    const allPoints = await db.SecurityAttentionPoint.findAll({
      unique: true,
      paranoid: true,
      order,
      attributes: [
        "id",
        "name",
        "description",
        "color",
        "address",
        "imageUri",
        "iconMap",
        "geolocation",
        "phone",
      ],
    });

    const data = allPoints.map((row) => {
      const mappedObject = {
        id: row.dataValues.id,
        name: row.dataValues.name,
        color: formatColorOutputForMobile(row.dataValues.color),
        iconMap: row.dataValues.iconMap,
        description: row.dataValues.description,
        address: row.dataValues.address,
        phone: String(row.dataValues.phone).replace("+57", ""),
        image: row.dataValues.imageUri,
        lat: row.dataValues.geolocation.coordinates[1],
        lon: row.dataValues.geolocation.coordinates[0],
      };
      return mappedObject;
    });
    return res.status(StatusCodes.OK).json(data);
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  getSecurityAttentionPoints,
};
