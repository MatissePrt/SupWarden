const crypto = require('crypto');
const secretKey = process.env.SECRET_KEY;

if (!secretKey || secretKey.length !== 64) {
    throw new Error('Invalid SECRET_KEY. It must be a 64 character long hexadecimal string.');
}

// Fonction de chiffrement
const encryptPassword = (password) => {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-256-ctr', Buffer.from(secretKey, 'hex'), iv);
    const encryptedPassword = Buffer.concat([cipher.update(password), cipher.final()]);

    const hmac = crypto.createHmac('sha256', Buffer.from(secretKey, 'hex'));
    hmac.update(iv);
    hmac.update(encryptedPassword);
    const hmacDigest = hmac.digest();

    return iv.toString('hex') + ':' + encryptedPassword.toString('hex') + ':' + hmacDigest.toString('hex');
};

// Fonction de déchiffrement
const decryptPassword = (encryptedPassword) => {
    const [ivHex, encrypted, hmacHex] = encryptedPassword.split(':');
    const iv = Buffer.from(ivHex, 'hex');
    const encryptedBuffer = Buffer.from(encrypted, 'hex');
    const hmac = Buffer.from(hmacHex, 'hex');

    const hmacCheck = crypto.createHmac('sha256', Buffer.from(secretKey, 'hex'));
    hmacCheck.update(iv);
    hmacCheck.update(encryptedBuffer);
    const hmacDigest = hmacCheck.digest();

    if (!crypto.timingSafeEqual(hmac, hmacDigest)) {
        throw new Error('Data integrity check failed');
    }

    const decipher = crypto.createDecipheriv('aes-256-ctr', Buffer.from(secretKey, 'hex'), iv);
    const decryptedPassword = Buffer.concat([decipher.update(encryptedBuffer), decipher.final()]);
    return decryptedPassword.toString();
};

module.exports = { encryptPassword, decryptPassword };
