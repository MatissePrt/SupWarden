const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const UserSchema = new mongoose.Schema({
    username: { type: String, required: true }, 
    email: { type: String, required: true, unique: true }, 
    password: { type: String }, 
    googleId: { type: String }, 
    imageUrl: { type: String }, 
    personalTrousseau: { type: mongoose.Schema.Types.ObjectId, ref: 'Trousseau' }, 
    invitations: [{
        trousseauId: { type: mongoose.Schema.Types.ObjectId, ref: 'Trousseau' }, 
        status: { type: String, default: 'pending' } 
    }],
    pin: { type: String },  // Ajouter un champ pour le code PIN
});

UserSchema.pre('save', async function (next) {
    if (this.isModified('pin') && this.pin) {
        const salt = await bcrypt.genSalt(10);
        this.pin = await bcrypt.hash(this.pin, salt);
    }
    next();
});

module.exports = mongoose.model('User', UserSchema);
