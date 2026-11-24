require('dotenv').config();
const nodemailer = require('nodemailer');

if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
  console.error('[email] EMAIL_USER or EMAIL_PASS is missing — check your .env file (and that it is loaded from the folder you start node in)');
}

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS, // must be a Gmail App Password, not your normal password
  },
  connectionTimeout: 10000,
  greetingTimeout: 10000,
  socketTimeout: 15000,
});

// Check credentials once at startup so problems show up immediately.
transporter.verify((err) => {
  if (err) {
    console.error('[email] Transporter verification FAILED:', err.message);
  } else {
    console.log('[email] Transporter ready — emails can be sent');
  }
});

async function send(mailOptions) {
  const info = await transporter.sendMail({ from: process.env.EMAIL_USER, ...mailOptions });
  console.log(`[email] Sent "${mailOptions.subject}" to ${mailOptions.to} (id: ${info.messageId})`);
  return info;
}

async function sendCredentialsEmail(toEmail, name, plainPassword) {
  return send({
    to: toEmail,
    subject: 'Your Placement Tracker Account Credentials',
    text: `Hi ${name},\n\nYour account has been created.\n\nLogin Email: ${toEmail}\nTemporary Password: ${plainPassword}\n\nYou will be asked to reset your password on first login.\n\nRegards,\nT&P Cell`,
  });
}

async function sendRoundUpdateEmail(toEmail, name, companyName, clearedRound, nextRound) {
  return send({
    to: toEmail,
    subject: `Update: You have moved to the next round at ${companyName}`,
    text: `Hi ${name},\n\nCongratulations! You have cleared the ${clearedRound} round at ${companyName}.\n\nYour next round: ${nextRound}\n\nPlease check the Placement Tracker for further details and prepare accordingly.\n\nAll the best!\n\nRegards,\nT&P Cell`,
  });
}

async function sendOfferEmail(toEmail, name, companyName, role, ctc, deadlineDays) {
  return send({
    to: toEmail,
    subject: `Congratulations! You received an offer from ${companyName}`,
    text: `Hi ${name},\n\nWe are happy to inform you that ${companyName} has extended an offer to you.\n\nRole: ${role}\nPackage: ${ctc}\n\nPlease log in to the Placement Tracker and accept or decline the offer within ${deadlineDays} days. After that, the offer will expire.\n\nCongratulations once again!\n\nRegards,\nT&P Cell`,
  });
}

module.exports = {
  sendCredentialsEmail,
  sendRoundUpdateEmail,
  sendOfferEmail,
};