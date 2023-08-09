const { StatusCodes } = require('http-status-codes');
const db = require('../../../../models');
const validator = require('../../utils/schemaValidator');
const { Sequelize } = require('sequelize');

// Retrieve all the advertisements whether they have a category or not.
const createRole = async (req, res, next) => {
  try {
    console.log(req.body);
    const {data} = await validator.validateRoleCreation(req.body);
    console.log(data);
    const roleCreation = await db.Role.create({ name: data.name });
    const responsePayload = {
      data: {
        ...roleCreation
      }
    }
    return res.status(StatusCodes.OK).json(responsePayload);
  } catch (error) {
    return next(error);
  }
};

// Create a new advertisement.
module.exports = {
  createRole
};