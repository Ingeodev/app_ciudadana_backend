const db = require("../../../models/index.js");
const user = require("../../../models/user.js");
const firebase = require("../utils/firebase_admin.js");
const { formatDate } = require("../utils/formatDate.js");
const Op = db.Sequelize.Op;

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
