const { StatusCodes } = require("http-status-codes");
const { appFirebase, adminFirebase } = require("../middleware/authMiddleware.js");

exports.createUser = async (data) => {
  try {
    let uid = null;

    try {
      const userData = await appFirebase.auth().getUserByEmail(data.email);
      uid = userData.uid;
    } catch (error) {
      // return {
      //   status: StatusCodes.INTERNAL_SERVER_ERROR,
      //   detail: `Error creating user: ${error.message}`,
      //   code: "Internal Server Error",
      // };
    }

    if (uid === null) {
      const userCreatedData = await appFirebase.auth().createUser({
        displayName: data.displayName,
        password: data.password,
        email: data.email,
        emailVerified: false,
      });
      uid = userCreatedData.uid;
    } else {
      // Update passwd
      const resUpdate = await appFirebase.auth().updateUser(uid, {
        displayName: data.displayName,
        password: data.password,
        email: data.email,
        emailVerified: false,
        disabled: false,
      });

      if (resUpdate === null || resUpdate === undefined) {
        return {
          status: StatusCodes.INTERNAL_SERVER_ERROR,
          detail: `Error updating user`,
          code: "Internal Server Error",
        };
      }
    }

    if (uid === null) {
      return {
        status: StatusCodes.INTERNAL_SERVER_ERROR,
        detail: `Error creating user`,
        code: "Internal Server Error",
      };
    }
    return { uid };
  } catch (error) {
    return {
      status: StatusCodes.INTERNAL_SERVER_ERROR,
      detail: `Error creating user: ${error.message}`,
      code: "Internal Server Error",
    };
  }
};

exports.setPasswd = async (uid, passwd) => {
  try {
    const resultUpdate = await appFirebase.auth().updateUser(uid, {
      password: passwd,
    });

    if (resultUpdate === null || resultUpdate === undefined) {
      return {
        status: StatusCodes.INTERNAL_SERVER_ERROR,
        detail: `Error updating password`,
        code: "Internal Server Error",
      };
    }
    return true;
  } catch (error) {
    return {
      status: StatusCodes.INTERNAL_SERVER_ERROR,
      detail: `Error updating password: ${error.message}`,
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

exports.generateLinkPasswordReset = async (userEmail, urlFront) => {
  try {
    const actionCodeSettings = {
      url: urlFront,
      // This must be true for email link sign-in.
      handleCodeInApp: true,
      // dynamicLinkDomain: "",
    };

    // Admin SDK API to generate the password reset link.
    const link = await appFirebase.auth().generatePasswordResetLink(userEmail, actionCodeSettings);

    if (link) {
      // returns the link to be sent by mail with sendgrid
      return link;
    } else {
      return {
        status: StatusCodes.INTERNAL_SERVER_ERROR,
        detail: `Error generating password reset link: ${error.message}`,
        code: "Internal Server Error",
      };
    }
  } catch (error) {
    return {
      status: StatusCodes.INTERNAL_SERVER_ERROR,
      detail: `Error generating password reset link: ${error.message}`,
      code: "Internal Server Error",
    };
  }
};

exports.generateLinkEmailVerification = async (userEmail, urlFront) => {
  try {    
    const actionCodeSettings = {
      url: urlFront,
      // This must be true for email link sign-in.
      handleCodeInApp: true,
      // dynamicLinkDomain: "",
    };
    const linkVerification = await appFirebase.auth().generateEmailVerificationLink(userEmail, actionCodeSettings);

    if (linkVerification) {
      return linkVerification;
    } else {
      return {
        status: StatusCodes.INTERNAL_SERVER_ERROR,
        detail: `Error generating mail verification link: ${error.message}`,
        code: "Internal Server Error",
      };
    }
  } catch (error) {
    return {
      status: StatusCodes.INTERNAL_SERVER_ERROR,
      detail: `Error generating mail verification link: ${error.message}`,
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
 * @return {object} Data user, if 200 ok. Or if there's error, json (objeto): status, code, detail
 */
exports.getUserByClientId = async (clientId) => {
  try {
    const userRecord = await appFirebase.auth().getUser(clientId);

    if (userRecord) {
      return userRecord;
    } else {
      return {
        status: StatusCodes.NOT_FOUND,
        message: "User not found",
      };
    }
  } catch (error) {
    return {
      status: StatusCodes.INTERNAL_SERVER_ERROR,
      message: error.message,
    };
  }
};

/**
 * Get data user by email corresponds to a user in Firebase
 * @param {string} email
 * @return {object} Data user, if 200 ok. Or if there's error, json (objeto): status, code, detail
 */
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
