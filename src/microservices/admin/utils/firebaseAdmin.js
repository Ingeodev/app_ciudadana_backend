const { StatusCodes } = require("http-status-codes");
const { appFirebase, adminFirebase } = require("../../../middleware/authMiddleware.js");
const emailService = require("./sendEmail.js");

exports.createUser = async (data) => {
  try {
    let uid = null;
    let emailVerified = false;

    try {
      const userData = await appFirebase.auth().getUserByEmail(data.email);  
      uid = userData.uid;
      emailVerified = userData.emailVerified;
    } catch (error) {
      // console.error("User not found, trying create an user in Firebase", error);
    }

    if (uid===null) {
      const userCreatedData = await appFirebase.auth().createUser({
        displayName: data.displayName,
        password: data.password,
        email: data.email,
        emailVerified: false,
      });
      uid = userCreatedData.uid;
    }

    if (uid === null) {
      return {
        status: StatusCodes.INTERNAL_SERVER_ERROR,
        detail: `Error creating admin user`,
        code: "Internal Server Error",
      };
    }
    return {uid, emailVerified};
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
    const response = await appFirebase.auth().setCustomUserClaims(uid, additionalClaims);
    return response;
  } catch (error) {
    return {
      status: StatusCodes.INTERNAL_SERVER_ERROR,
      detail: `Error adding custom claim: ${error.message}`,
      code: "Internal Server Error",
    };
  }
};

exports.passwordReset = async (userEmail) => {
  try {
    const actionCodeSettings = {
      url: "http://localhost:3000",
      // This must be true for email link sign-in.
      handleCodeInApp: true,
      // dynamicLinkDomain: "",
    };

    // Admin SDK API to generate the password reset link.
    const link = await appFirebase.auth().generatePasswordResetLink(userEmail, actionCodeSettings);

    if (link) {
      const data = {
        to: userEmail,
        subject: "AppMoviliad Cali - Restablecimiento de Contraseña",
        html: `<strong> ${link} </strong>`,
      };
      const resSend = await emailService.sendEmail(data);
      return resSend;
    } else {
      return {
        status: StatusCodes.INTERNAL_SERVER_ERROR,
        detail: `Error generating password reset link - admin: ${error.message}`,
        code: "Internal Server Error",
      };
    }
  } catch (error) {
    return {
      status: StatusCodes.INTERNAL_SERVER_ERROR,
      detail: `Error password reset - admin: ${error.message}`,
      code: "Internal Server Error",
    };
  }
};

exports.emailVerification = async (userEmail) => {
  try {
    const actionCodeSettings = {
      url: "http://localhost:3000",
      // This must be true for email link sign-in.
      handleCodeInApp: true,
      // dynamicLinkDomain: "",
    };
    const link = await appFirebase.auth().generateEmailVerificationLink(userEmail, actionCodeSettings);

    if (link) {
      const data = {
        to: userEmail,
        subject: "AppMoviliad Cali - Verificación de correo",
        html: `<strong> ${link} </strong>`,
      };
      const resSend = await emailService.sendEmail(data);
      return resSend;
    } else {
      return {
        status: StatusCodes.INTERNAL_SERVER_ERROR,
        detail: `Error generating email verification link - admin: ${error.message}`,
        code: "Internal Server Error",
      };
    }
  } catch (error) {
    return {
      status: StatusCodes.INTERNAL_SERVER_ERROR,
      detail: `Error email verification - admin: ${error.message}`,
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

exports.getUserDataByEmail = async (email) => {
  try {
    const userRecord = await adminFirebase.auth().getUserByEmail(email);

    if (userRecord) {
      return userRecord;
    } else {
      return {
        status: StatusCodes.NOT_FOUND,
        detail: `User not found in Firebase.`,
        code: "Not Found",
      };
    }
  } catch (error) {
    return {
      status: StatusCodes.INTERNAL_SERVER_ERROR,
      detail: `Error getting user data in Firebase: ${error.message}`,
      code: "Internal server error",
    };
  }
};