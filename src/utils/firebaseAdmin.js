const { StatusCodes } = require("http-status-codes");
const { appFirebase, adminFirebase } = require("../middleware/authMiddleware.js");
const mailService = require("../microservices/admin/utils/sendMail.js");

exports.createUser = async (data) => {
  try {
    let uid = null;

    try {
      const userData = await appFirebase.auth().getUserByEmail(data.email);
      uid = userData.uid;
    } catch (error) {
      return {
        status: StatusCodes.INTERNAL_SERVER_ERROR,
        detail: `Error creating user: ${error.message}`,
        code: "Internal Server Error",
      };
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
        detail: `Error generating password reset link: ${error.message}`,
        code: "Internal Server Error",
      };
    }
  } catch (error) {
    return {
      status: StatusCodes.INTERNAL_SERVER_ERROR,
      detail: `Error password reset: ${error.message}`,
      code: "Internal Server Error",
    };
  }
};

exports.mailInvitationVerification = async (dataUser, urlFront) => {
  try {    
    const actionCodeSettings = {
      url: urlFront,
      // This must be true for email link sign-in.
      handleCodeInApp: true,
      // dynamicLinkDomain: "",
    };
    const linkVerification = await appFirebase.auth().generateEmailVerificationLink(dataUser.email, actionCodeSettings);

    if (linkVerification) {
      const data = {
        to: dataUser.email,
        subject: "Invitación AppMoviliad Cali",
        html: `
            <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f4f4f4; color: #333;">
                <h2 style="color: #007BFF;">¡Bienvenido a AppMovilidad Cali!</h2>
                <p>Hola ${dataUser.displayName},</p>
                <p>Te invitamos a unirte a la plataforma de movilidad de la Ciudad de Cali, Colombia. Para comenzar, es importante que verifiques tu correo electrónico. Haz clic en el siguiente enlace para hacerlo:</p>
                <a href="${linkVerification}" style="display: inline-block; padding: 10px 20px; background-color: #007BFF; color: #ffffff; text-decoration: none; border-radius: 5px;">Verificar Correo</a>
                <p>Una vez verificado, podrás acceder a todos los módulos de la aplicación.</p>
                <h3>Tus credenciales son:</h3>
                <ul>
                    <li><strong>Usuario:</strong> ${dataUser.email}</li>
                    <li><strong>Contraseña:</strong> ${dataUser.password}</li>
                </ul>
                <p>Puedes ingresar a la aplicación haciendo clic en el siguiente enlace:</p>
                <a href="${urlFront}" style="display: inline-block; padding: 10px 20px; background-color: #007BFF; color: #ffffff; text-decoration: none; border-radius: 5px;">Ingresar a AppMovilidad Cali</a>
                <p>¡Esperamos que disfrutes de la plataforma!</p>
                <p>Saludos,<br>Equipo de AppMovilidad Cali</p>
            </div>
       `,
      };
      const resSend = await mailService.sendMail(data);
      // const resSend = true;
      return resSend;
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
      detail: `Error email verification: ${error.message}`,
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