const mongoose = require('mongoose');

const TrousseauSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    elements: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Element' }]
}, { timestamps: true });

module.exports = mongoose.model('Trousseau', TrousseauSchema);
