const crypto = require('crypto');
const secretKey = process.env.SECRET_KEY;

if (!secretKey || secretKey.length !== 64) {
    throw new Error('Invalid SECRET_KEY. It must be a 64 character long hexadecimal string.');
}

const encryptPassword = (password) => {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-256-ctr', Buffer.from(secretKey, 'hex'), iv);
    const encryptedPassword = Buffer.concat([cipher.update(password), cipher.final()]);
    return iv.toString('hex') + ':' + encryptedPassword.toString('hex');
};

const decryptPassword = (encryptedPassword) => {
    const [ivHex, encrypted] = encryptedPassword.split(':');
    const iv = Buffer.from(ivHex, 'hex');
    const encryptedBuffer = Buffer.from(encrypted, 'hex');
    const decipher = crypto.createDecipheriv('aes-256-ctr', Buffer.from(secretKey, 'hex'), iv);
    const decryptedPassword = Buffer.concat([decipher.update(encryptedBuffer), decipher.final()]);
    return decryptedPassword.toString();
};

module.exports = { encryptPassword, decryptPassword };
