const bycrypt = require('bcrypt');;
const SALT_ROUNDS = 10; // Number of salt rounds for hashing

async function hashPassword(normalPassword) {
    return await bycrypt.hash(normalPassword, SALT_ROUNDS);


}

async function comparePassword(normalPassword, hashedPassword) {
    return await bycrypt.compare(normalPassword, hashedPassword);
}

module.exports = {
    hashPassword,
    comparePassword
};

const crypto = require('crypto');

function generateRandomPassword(length = 5) {
  return crypto.randomBytes(length)
    .toString('base64')
    .replace(/[^a-zA-Z0-9]/g, '')
    .slice(0, length);
}

module.exports = { hashPassword, comparePassword, generateRandomPassword };
//10