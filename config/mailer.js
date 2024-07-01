const nodemailer = require("nodemailer");
require("dotenv").config();

console.log(process.env.GMAIL_PASSWORD, "Hello World");
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.GMAIL,
    pass: process.env.GMAIL_PASSWORD,
  },
});

module.exports = transporter;
