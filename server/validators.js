function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return typeof email === 'string' && emailRegex.test(email);
}

function isValidPassword(password) {
  return typeof password === 'string' && password.length >= 6;
}

function isValidMobile(mobile) {
  if (!mobile) return true; // optional field
  return /^[0-9]{10}$/.test(mobile);
}

module.exports = { isValidEmail, isValidPassword, isValidMobile };