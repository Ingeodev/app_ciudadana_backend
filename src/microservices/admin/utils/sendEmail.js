const { StatusCodes } = require("http-status-codes");
const sgMail = require("@sendgrid/mail");
const sgKey = require("../../../email_service_key.json");
sgMail.setApiKey(sgKey.api_key);

/**
 * Send an email using SendGrid
 * @param {object} data Object containing to, subject, and html of the mail
 * @return {boolean} true, if the email was sent successfully
 */
exports.sendEmail = async (data) => {
  try {
    const msg = {
      to: data.to,
      from: sgKey.email,
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
