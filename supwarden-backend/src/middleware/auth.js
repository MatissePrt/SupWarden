const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            console.log('Token reçu:', token);  // Log du token reçu
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = await User.findById(decoded.id).select('-password');
            console.log('Utilisateur décrypté:', req.user);  // Log de l'utilisateur décrypté
            next();
        } catch (error) {
            console.error('Erreur lors de la vérification du token:', error.message);
            res.status(401).json({ message: 'Non autorisé, échec du token' });
        }
    } else {
        res.status(401).json({ message: 'Non autorisé, pas de token' });
    }
};

module.exports = auth;
