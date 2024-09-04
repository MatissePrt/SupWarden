const User = require('../models/User');
const Trousseau = require('../models/Trousseau');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const jwtExpiresIn = process.env.JWT_EXPIRES_IN || "4d";

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

        user.personalTrousseau = await createPersonalTrousseau(user._id);
        await user.save();

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: jwtExpiresIn || "4d"});

        res.json({ token });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Erreur serveur');
    }
};

exports.login = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(400).json({ message: 'Utilisateur ou mot de passe incorrect' });
        }

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: jwtExpiresIn || "4d"});

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

exports.changePassword = async (req, res) => {
    const { currentPassword, newPassword } = req.body;

    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: 'Utilisateur non trouvé' });
        }

        if (!user.password) {
            return res.status(400).json({ message: 'Les utilisateurs connectés via Google ne peuvent pas changer leur mot de passe.' });
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

exports.googleLogin = async (req, res) => {
    const { googleId, email, name, imageUrl } = req.body;

    try {
        let user = await User.findOne({ email });

        if (user) {
            if (user.googleId && user.googleId !== googleId) {
                return res.status(400).json({ message: "Cet email est déjà associé à un autre compte Google." });
            }
            
            if (!user.googleId) {
                user.googleId = googleId;
                user.imageUrl = imageUrl;
                await user.save();
            }
        } else {
            user = new User({
                googleId,
                email,
                username: name,
                imageUrl,
            });

            user.personalTrousseau = await createPersonalTrousseau(user._id);
            await user.save();
        }

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: jwtExpiresIn || "4d"});

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

exports.setPin = async (req, res) => {
    const { pin } = req.body;

    if (!pin) {
        return res.status(400).json({ message: 'Le code PIN est requis' });
    }

    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: 'Utilisateur non trouvé' });
        }

        user.pin = pin;
        await user.save();

        res.json({ success: true, message: 'Code PIN mis à jour avec succès' });
    } catch (err) {
        console.error('Erreur lors de la mise à jour du code PIN', err);
        res.status(500).send('Erreur serveur');
    }
};
