const User = require('../models/User');
const Trousseau = require('../models/Trousseau');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Inscription de l'utilisateur
exports.register = async (req, res) => {
    const { username, email, password } = req.body;

    try {
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ message: 'Utilisateur déjà enregistré' });
        }

        user = new User({ username, email, password });

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);

        // Créer un trousseau personnel
        const personalTrousseau = new Trousseau({ 
            name: 'Trousseau personnel',
            description: 'Trousseau personnel',
            owner: user._id,
            members: [user._id]
        });

        await personalTrousseau.save();
        user.personalTrousseau = personalTrousseau._id;
        await user.save();

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });

        res.json({ token });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Erreur serveur');
    }
};

// Connexion de l'utilisateur
// Connexion de l'utilisateur
exports.login = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Utilisateur non trouvé' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Mot de passe incorrect' });
        }

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });

        // Modification : inclure l'ID utilisateur et d'autres informations utiles dans la réponse
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



