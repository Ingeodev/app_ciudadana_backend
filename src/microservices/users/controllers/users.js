const db = require("../../../models/index.js");
const user = require("../../../models/user.js");
const firebase = require("../utils/firebase_admin.js");
const { formatDate } = require("../utils/formatDate.js");
const Op = db.Sequelize.Op;

/**
 * Verifies that the UID corresponds to a user in Firebase
 * @param {object} req - Object containing the clientId
 * @return {object} Response contiene: statuscode (integer), json (objeto): code, msg, data.
 */
const findUserByClientId = async (clientId) => {
  const result = await db.User.findOne({
    where: { clientId },
  });
  return result;
}

// const createUser = async (firstName, lastName, email) => {
//   // console.log(db);
//   await db.User.create({
//     firstName,
//     lastName,
//     email
//   })
// }
// createUser('pepe', 'perez', 'pepeperez@gmail.com')

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
  const r_firebase = await firebase.verifyClientId(clientId);
  if (r_firebase.code === 200) {
    const r_user = await findUserByClientId(clientId);
    if (r_user) {
      res.statusCode = 200;
      res.json({
        // ! token es enviado dentro de req.cabecera
        // ! Ó se genera un nuevo token?
        token: authorization[1],
        loginPhase: r_user.dataValues.loginPhase,
        userInfo: {
          name: r_user.dataValues.name,
          lastName: r_user.dataValues.lastName,
          email: r_user.dataValues.email,
          // ! Front - Firebase - Register phoneNumber
          phone: r_firebase.data.phoneNumber || 0,
        },
      });
    }    
  } else {
    res.statusCode = r_firebase.code;
    // res.send({ message: result.message });
  }
};