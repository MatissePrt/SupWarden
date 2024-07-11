const mongoose = require('mongoose');
const crypto = require('crypto');

const ElementSchema = new mongoose.Schema({
    name: { type: String, required: true },
    username: { type: String, required: true },
    password: { type: String, required: true },
    uri: { type: String, required: true },
    note: { type: String },
    customFields: [{
        key: { type: String },
        value: { type: String }
    }],
    trousseau: { type: mongoose.Schema.Types.ObjectId, ref: 'Trousseau' }
});

ElementSchema.pre('save', function (next) {
    if (!this.isModified('password')) {
        return next();
    }
    try {
        const algorithm = 'aes-256-cbc';
        const key = process.env.SECRET_KEY.slice(0, 32);
        const iv = crypto.randomBytes(16);
        const cipher = crypto.createCipheriv(algorithm, Buffer.from(key), iv);
        let encrypted = cipher.update(this.password);
        encrypted = Buffer.concat([encrypted, cipher.final()]);
        this.password = iv.toString('hex') + ':' + encrypted.toString('hex');
        next();
    } catch (err) {
        next(err);
    }
});

module.exports = mongoose.model('Element', ElementSchema);
