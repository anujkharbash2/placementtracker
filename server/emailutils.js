require('dotenv').config();
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

async function sendCredentialsEmail(toEmail, name, plainPassword) {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: toEmail,
    subject: 'Your Placement Tracker Account Credentials',
    text: `Hi ${name},\n\nYour account has been created.\n\nLogin Email: ${toEmail}\nTemporary Password: ${plainPassword}\n\nYou will be asked to reset your password on first login.\n\nRegards,\nT&P Cell`,
  };

  await transporter.sendMail(mailOptions);
}

module.exports = { sendCredentialsEmail };