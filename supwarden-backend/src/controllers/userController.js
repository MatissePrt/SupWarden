const User = require('../models/User');
const Trousseau = require('../models/Trousseau');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Fonction utilitaire pour créer un trousseau personnel
const createPersonalTrousseau = async (userId) => {
    const personalTrousseau = new Trousseau({ 
        name: 'Trousseau personnel',
        description: 'Trousseau personnel',
        owner: userId,
        members: [userId]
    });

    await personalTrousseau.save();
    return personalTrousseau._id;
};

// Inscription de l'utilisateur
exports.register = async (req, res) => {
    const { username, email, password } = req.body;

    try {
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ message: 'Utilisateur déjà enregistré' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        user = new User({ username, email, password: hashedPassword });

        // Créer un trousseau personnel
        user.personalTrousseau = await createPersonalTrousseau(user._id);
        await user.save();

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '3d' });

        res.json({ token });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Erreur serveur');
    }
};

// Connexion de l'utilisateur
exports.login = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(400).json({ message: 'Utilisateur ou mot de passe incorrect' });
        }

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '1d' });

        res.json({ 
            token,
            _id: user._id,
            username: user.username,
            email: user.email
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Erreur serveur');
    }
};

// Changement de mot de passe
exports.changePassword = async (req, res) => {
    const { currentPassword, newPassword } = req.body;

    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: 'Utilisateur non trouvé' });
        }

        // Vérifier si l'utilisateur se connecte avec Google
        if (!user.password) {
            return res.status(400).json({ message: 'Les utilisateurs Google ne peuvent pas changer leur mot de passe ici.' });
        }

        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'L\'ancien mot de passe est incorrect' });
        }

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);
        await user.save();

        res.json({ message: 'Mot de passe mis à jour avec succès' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Erreur serveur');
    }
};

// Récupération des invitations de l'utilisateur
exports.getUserInvitations = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).populate('invitations.trousseauId', 'name');
        if (!user) {
            return res.status(404).json({ success: false, message: 'Utilisateur non trouvé' });
        }

        const invitations = user.invitations.map(inv => ({
            trousseauId: inv.trousseauId._id,
            trousseauName: inv.trousseauId.name,
            email: user.email,
            status: inv.status
        }));

        res.json({ success: true, invitations });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
};

// Connexion via Google
exports.googleLogin = async (req, res) => {
    const { googleId, email, name, imageUrl } = req.body;

    try {
        // Vérifiez d'abord si un utilisateur avec ce googleId existe déjà
        let user = await User.findOne({ googleId });

        if (!user) {
            // Si googleId est unique, créez un nouvel utilisateur
            user = new User({
                googleId,
                email,
                username: name,
                imageUrl,
            });

            // Créer un trousseau personnel
            user.personalTrousseau = await createPersonalTrousseau(user._id);
            await user.save();
        } else {
            // Si un utilisateur avec ce googleId existe déjà, vous pouvez retourner une erreur
            return res.status(400).json({ message: "Cet identifiant Google est déjà utilisé." });
        }

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '1d' });

        res.json({ 
            token,
            _id: user._id,
            username: user.username,
            email: user.email,
            imageUrl: user.imageUrl 
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Erreur lors de la connexion via Google' });
    }
};
