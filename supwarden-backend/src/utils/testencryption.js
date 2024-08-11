require('dotenv').config();

const { encryptPassword, decryptPassword } = require('./encryption');

const secretKey = process.env.SECRET_KEY;
console.log("SECRET_KEY:", secretKey);

const encrypted = encryptPassword("monMotDePasse");
console.log("Mot de passe chiffré:", encrypted);

const decrypted = decryptPassword(encrypted);
console.log("Mot de passe déchiffré:", decrypted);
