const mongoose = require('mongoose');
const { encryptPassword } = require('../utils/encryption');

const ElementSchema = new mongoose.Schema({
    name: { type: String, required: true },
    username: { type: String, required: true },
    password: { type: String, required: true },
    uri: { type: String, required: true },
    note: { type: String },
    sensitive: { type: Boolean, default: false },
    customFields: [{
        key: { type: String },
        value: { type: String }
    }],
    attachments: [{
        filename: { type: String },
        contentType: { type: String },
        data: { type: Buffer }
    }],
    trousseau: { type: mongoose.Schema.Types.ObjectId, ref: 'Trousseau' }
});

ElementSchema.pre('save', function (next) {
    if (!this.isModified('password')) {
        return next();
    }
    try {
        this.password = encryptPassword(this.password);
        next();
    } catch (err) {
        next(err);
    }
});

module.exports = mongoose.model('Element', ElementSchema);
