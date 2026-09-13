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


//10