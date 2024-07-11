const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    username: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    invitations: [{
        trousseauId: { type: mongoose.Schema.Types.ObjectId, ref: 'Trousseau' },
        status: { type: String, default: 'pending' }
    }]
});

module.exports = mongoose.model('User', UserSchema);
