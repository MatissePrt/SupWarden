const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    username: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String }, // Le mot de passe est facultatif (requis pour les connexions classiques)
    googleId: { type: String }, // ID Google pour les connexions via Google
    imageUrl: { type: String }, // URL de l'image de profil pour les utilisateurs Google
    personalTrousseau: { type: mongoose.Schema.Types.ObjectId, ref: 'Trousseau' }, 
    invitations: [{
        trousseauId: { type: mongoose.Schema.Types.ObjectId, ref: 'Trousseau' },
        status: { type: String, default: 'pending' }
    }]
});

module.exports = mongoose.model('User', UserSchema);
