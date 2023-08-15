const { StatusCodes } = require("http-status-codes");
const { appFirebase, adminFirebase } = require("../../../middleware/authMiddleware.js");

exports.createUser = async (data) => {
  try {
    const { uid } = await appFirebase.auth().createUser({
      displayName: data.displayName,
      password: data.password,
      email: data.email,
    });

    if (uid === null) {
      return {
        status: StatusCodes.INTERNAL_SERVER_ERROR,
        detail: `Error creating admin user`,
        code: "Internal Server Error",
      };
    }

    return uid;
  } catch (error) {
    return {
      status: StatusCodes.INTERNAL_SERVER_ERROR,
      detail: `Error creating admin user: ${error.message}`,
      code: "Internal Server Error",
    };
  }
};

exports.addCustomClaim = async (uid, role) => {
  try {
    const additionalClaims = {
      // role: "super_master_user",
      role,
    };
    const response = await appFirebase
      .auth()
      .setCustomUserClaims(uid, additionalClaims);

    return response;
  } catch (error) {
    return {
      status: StatusCodes.INTERNAL_SERVER_ERROR,
      detail: `Error creating admin user: ${error.message}`,
      code: "Internal Server Error",
    };
  }
};

const createCustomTokens = async (uid) => {
  const additionalClaims = {
    role: "super_master_user",
  };
  const token = await appFirebase.auth().createCustomToken(uid, additionalClaims);
  console.log(token);
  /*
  curl 'https://identitytoolkit.googleapis.com/v1/accounts:signInWithCustomToken?key=' \
  -H 'Content-Type: application/json' \
  --data-binary '{"token":"","returnSecureToken":true}'
  */
};

// createCustomTokens('s0uHrqRLPSPomarJsLZVjOpbwx42');
// addCustomClaimToUser('s0uHrqRLPSPomarJsLZVjOpbwx42');
// createUserWithRole('PepePerez', 'myPassword123', 'pepeperez@gmail.com')

/**
 * Get data user by clientId corresponds to a user in Firebase
 * @param {string} clientId
 * @return {object} Contains: statusCode (integer - HTTP response status codes), msg (string - Descriptive message), data.
 */
exports.getUserByClientId = async (clientId) => {
  try {
    const userRecord = await adminFirebase.auth().getUser(clientId);

    if (userRecord) {
      return {
        code: 200,
        msg: `User with ID: ${clientId} exists`,
        data: userRecord,
      };
    } else {
      return { code: 404, msg: "User not found", data: null };
    }
  } catch (error) {
    return { code: 500, msg: "Error checking user: " + error, data: null };
  }
};