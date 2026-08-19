const { StatusCodes } = require("http-status-codes");
const sgMail = require("@sendgrid/mail");

let sgKey = {};
try {
  sgKey = require("../config/email_service_key.json");
} catch (error) {
  sgKey = {};
}

const sgApiKey = process.env.SENDGRID_API_KEY || sgKey.api_key;
const sgFromEmail = process.env.SENDGRID_EMAIL || sgKey.email;

if (sgApiKey) {
  sgMail.setApiKey(sgApiKey);
}

/**
 * Send an email using SendGrid
 * @param {object} data Object containing to, subject, and html of the mail
 * @return {boolean} true, if the email was sent successfully
 */
exports.sendMail = async (data) => {
  try {
    const msg = {
      to: data.to,
      from: sgFromEmail,
      subject: data.subject,
      html: data.html,
    };
    await sgMail.send(msg);
    return true;
  } catch (error) {
    return {
      status: StatusCodes.INTERNAL_SERVER_ERROR,
      detail: `Error sending email: ${error.message}`,
      code: "Internal Server Error",
    };
  }
};
