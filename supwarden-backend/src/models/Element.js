const mongoose = require('mongoose');
const { encryptPassword } = require('../utils/encryption');

const ElementSchema = new mongoose.Schema({
    name: { type: String, required: true },
    username: { type: String, required: true },
    password: { type: String, required: true },
    uris: { type: [String], default: [] },
    note: { type: String },
    sensitive: { type: Boolean, default: false },
    customFields: [{
        key: { type: String, enum: ['visible', 'masqué', 'file'] },
        value: mongoose.Schema.Types.Mixed  // Permet soit une chaîne, soit un objet
    }],
    attachments: [{
        filename: { type: String },
        contentType: { type: String },
        data: { type: Buffer }
    }],
    trousseau: { type: mongoose.Schema.Types.ObjectId, ref: 'Trousseau' },
    editors: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    creatorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },  // Ajoutez ce champ
});

ElementSchema.pre('save', function (next) {
    if (this.isModified('password')) {
        try {
            this.password = encryptPassword(this.password);
        } catch (err) {
            return next(err);
        }
    }
    next();
});

module.exports = mongoose.model('Element', ElementSchema);
