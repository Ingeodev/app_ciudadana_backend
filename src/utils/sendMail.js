const { StatusCodes } = require("http-status-codes");
const nodemailer = require("nodemailer");

const emailProvider = process.env.EMAIL_PROVIDER || "sendgrid";

let sendgridApiKey = process.env.SENDGRID_API_KEY?.trim();
const sendgridFromEmail = process.env.SENDGRID_EMAIL?.trim();

let sgMail = null;
if (emailProvider === "sendgrid" && sendgridApiKey) {
  sgMail = require("@sendgrid/mail");
  sgMail.setApiKey(sendgridApiKey);
}

const gmailUser = process.env.GMAIL_USER?.trim();
const gmailAppPassword = process.env.GMAIL_APP_PASSWORD?.trim();

let gmailTransporter = null;
if (emailProvider === "gmail" && gmailUser && gmailAppPassword) {
  gmailTransporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: gmailUser,
      pass: gmailAppPassword,
    },
  });
}

const sendMailViaSendGrid = async (data) => {
  const msg = {
    to: data.to,
    from: sendgridFromEmail,
    subject: data.subject,
    html: data.html,
  };
  await sgMail.send(msg);
  return true;
};

const sendMailViaGmail = async (data) => {
  const mailOptions = {
    from: gmailUser,
    to: data.to,
    subject: data.subject,
    html: data.html,
  };
  await gmailTransporter.sendMail(mailOptions);
  return true;
};

exports.sendMail = async (data) => {
  try {
    if (emailProvider === "sendgrid") {
      if (!sgMail) {
        return {
          status: StatusCodes.INTERNAL_SERVER_ERROR,
          detail: "Error sending email: SendGrid API key not configured",
          code: "Internal Server Error",
        };
      }
      return await sendMailViaSendGrid(data);
    }

    if (emailProvider === "gmail") {
      if (!gmailTransporter) {
        return {
          status: StatusCodes.INTERNAL_SERVER_ERROR,
          detail: "Error sending email: Gmail credentials not configured",
          code: "Internal Server Error",
        };
      }
      return await sendMailViaGmail(data);
    }

    return {
      status: StatusCodes.INTERNAL_SERVER_ERROR,
      detail: `Error sending email: Unknown email provider "${emailProvider}"`,
      code: "Internal Server Error",
    };
  } catch (error) {
    return {
      status: StatusCodes.INTERNAL_SERVER_ERROR,
      detail: `Error sending email: ${error.message}`,
      code: "Internal Server Error",
    };
  }
};
