const transporter = require("../config/mailer");

async function sendResetEmail(email, resetLink) {
  try {
    await transporter.sendMail({
      from: '"Rishav" <baxel281@gmail.com>',
      to: email,
      subject: "Password Reset Request",
      text: `Click the following link to reset your password: ${resetLink}`,
      // html: `<p>You have requested to reset your password. Please follow this <a href="${resetLink}">link</a> to reset your password.</p>`,
    });

    console.log(`Password reset email sent to ${email}`);
  } catch (error) {
    console.error("Error sending password reset email:", error);
    throw new Error("Failed to send password reset email");
  }
}

module.exports = sendResetEmail;
