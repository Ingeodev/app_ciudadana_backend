const { StatusCodes } = require("http-status-codes");
const { appFirebase, adminFirebase } = require("../../../middleware/authMiddleware.js");
// const emailService = require("./sendEmail.js");

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

// exports.passwordReset = async (userEmail) => {
//   try {
//     const actionCodeSettings = {
//       // URL you want to redirect back to. The domain (www.example.com) for
//       // this URL must be whitelisted in the Firebase Console.
//       url: "http://localhost:3000",
//       // This must be true for email link sign-in.
//       handleCodeInApp: true,
//       // iOS: {
//       //   bundleId: "com.example.ios",
//       // },
//       // android: {
//       //   packageName: "com.example.android",
//       //   installApp: true,
//       //   minimumVersion: "12",
//       // },
//       // FDL custom domain.
//       // dynamicLinkDomain: "",
//     };

//     // Admin SDK API to generate the password reset link.
//     const response = await appFirebase
//       .auth()
//       .generatePasswordResetLink(userEmail, actionCodeSettings)
//       .then((link) => {
//         // Construct password reset email template, embed the link and send
//         // using custom SMTP server.
//         return emailService.sendCustomPasswordResetEmail(userEmail, link);
//       })
//       .catch((error) => {
//         return {
//           status: StatusCodes.INTERNAL_SERVER_ERROR,
//           detail: `Error password reset admin: ${error.message}`,
//           code: "Internal Server Error",
//         };
//       });

//     return response;
//   } catch (error) {
//     return {
//       status: StatusCodes.INTERNAL_SERVER_ERROR,
//       detail: `Error creating admin user: ${error.message}`,
//       code: "Internal Server Error",
//     };
//   }
// };

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