const { StatusCodes } = require("http-status-codes");
const sgMail = require("@sendgrid/mail");
const sgKey = require("../../../email_service_key.json");
sgMail.setApiKey(sgKey.api_key);

/**
 * Send an email using SendGrid
 * @param {string} userEmail
 * @param {string} body
 * @return {boolean} true, if the mail was sent
 */
exports.sendCustomPasswordResetEmail = async (userEmail, body) => {
  try {
    const msg = {
      to: userEmail, // Change to your recipient
      from: "andres.garzon@thebitbang.company", // Change to your verified sender
      subject: "Reset Password",
      text: `${body}`,
      html: `<strong> ${body} </strong>`,
      // html: "<strong>and easy to do anywhere, even with Node.js</strong>",
    };

    sgMail
      .send(msg)
      .then(() => {
        console.log("Email sent");
        return true;
      })
      .catch((error) => {
        console.error(error);
        return {
          status: StatusCodes.INTERNAL_SERVER_ERROR,
          detail: error.message,
          code: "Internal Server Error",
        };
      });

    
  } catch (error) {
    return {
      status: StatusCodes.INTERNAL_SERVER_ERROR,
      detail: `Error creating admin user: ${error.message}`,
      code: "Internal Server Error",
    };
  }
};
