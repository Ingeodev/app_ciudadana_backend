const db = require("../../../models/index.js");
const user = require("../../../models/user.js");
const firebase = require("../utils/firebaseAdmin.js");
const { formatDate } = require("../utils/formatDate.js");
const { StatusCodes } = require('http-status-codes');
const Op = db.Sequelize.Op;

/**
 * Verifies that the UID corresponds to a user in Firebase
 * @param {string} clientId
 * @return {object} User object if found, null if not
 */
const findUserByClientId = async (clientId) => {
  const result = await db.User.findOne({
    where: { clientId },
  });
  return result;
}

// ! Quitar serviceReceipt, o bueno, este se va a manejar con FirebaseStorage
/**
 * Update a user in the database using the clientId
 * @param {string} clientId
 * @param {object} data - Object containing: documentType, documentNumber, birthDate, residenceAddress, serviceReceipt
 * @return {object} Response of the update operation
 */
const updateUserByClientId = async (clientId, data) => {  
  const result = await db.User.update(data, {
    where: { clientId },
  });
  return result;
}

/**
 * New user registration, all login must be done through firebase so additional account data is registered and the user is linked in firebase with the clientId.
 * @param {object} req - Object containing the clientId, name, lastName, phone, email
 * @return {object} Response contains: statuscode (integer), json (objeto): code, msg, data.
 */
exports.registerNewUser = async (req, res) => {
  const { clientId, name, lastName, email } = req.body;
  // ! token es enviado dentro de req.cabecera
  // ! Ó se genera un nuevo token?
  const authorization = req.get("Authorization").split(" ");
  const date = formatDate(new Date());
  await db.User.create({
    clientId,
    name,
    lastName,
    email,
    loginPhase: "notRegistered",
    createdAt: date,
    updatedAt: date,
  })
    .then((data) => {
      // ! token es enviado dentro de req.cabecera
      // ! Ó se genera un nuevo token?
      res.send({ token: authorization[1] });
    })
    .catch((err) => {
      res.status(400).send({
        message: "invalid input",
      });
    });
};

/**
 * Verifies that the UID corresponds to a user in Firebase
 * @param {object} req - Object containing the clientId
 * @return {object} Response contiene: statuscode (integer), json (objeto): code, msg, data.
 */
exports.validateFirebaseClientId = async (req, res) => {
  const { clientId } = req.body;
  console.log(`clientId: ${clientId}`);
  const authorization = req.get("Authorization").split(" ");
  // ! Demora mucho cuando el clientId no conincide
  const firebaseResponse = await firebase.getUserByClientId(clientId);
  if (firebaseResponse.code === 200) {
    const firebaseUser = await findUserByClientId(clientId);
    if (firebaseUser) {
      res.statusCode = 200;
      res.json({
        // ! token es enviado dentro de req.cabecera
        // ! Ó se genera un nuevo token?
        token: authorization[1],
        loginPhase: firebaseUser.dataValues.loginPhase,
        userInfo: {
          name: firebaseUser.dataValues.name,
          lastName: firebaseUser.dataValues.lastName,
          email: firebaseUser.dataValues.email,
          // ! Front - Firebase - Register phoneNumber
          phone: firebaseResponse.data.phoneNumber || 0,
        },
      });
    }    
  } else {
    res.statusCode = firebaseResponse.code;
    // res.send({ message: result.message });
  }
};


/**
 * Update a user (existing in db) with missing information
 * @param {object} req - Object containing: documentType, documentNumber, birthDate, residenceAddress, serviceReceipt (file)
 * @return {object} Response contains: statuscode (integer), json (objeto): code, msg, data.
 */
exports.fullLogin = async (req, res) => {
  console.log(req.file);
  const clientId = res.locals.uid;

  const resultUpdate = await updateUserByClientId(clientId, {
    documentType: req.body.documentType,
    numberDocument: req.body.numberDocument,
    birthDate: req.body.birthDate,
    residenceAddress: req.body.residenceAddress,
    serviceReceipt: req.file.originalname,
  });
  if (resultUpdate[0] === 1) {
    res.status(200).send({
      message: "successful operation",
    });
  } else {
    res.status(400).send({
      message: "invalid input",
    });
  }
};

exports.accountInfo = async (req, res, next) => {
  try {
    const clientId = res.locals.uid;
    const userInDb = await db.User.findOne({
      where: {clientId},
    });
    console.info("userInDb: ", userInDb);
    let responseBody = {
      data: {
        loginPhase: 'notRegister',
        userInfo: {}
      }
    };
    //TBD loginPhaseToBeDefined
    if (userInDb.dataValues){
      responseBody = {
        data: {
          loginPhase: 'register',
          userInfo: {
            name: userInDb.dataValues.name,
            lastName: userInDb.dataValues.lastName,
            email: userInDb.dataValues.email,
            phone: userInDb.data.phoneNumber || ''
          }
        }
      }
    }
    res.status(StatusCodes.OK).send(responseBody);
  } catch (error) {
    console.error('account info could not be retrieved: ', error);
    // next(new Error({ message: ''}))
    res.status(500).send({
      message: "Internal server error in users controller accountInfo"
    });
  }
};
