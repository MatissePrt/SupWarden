const User = require('../models/User');
const Trousseau = require('../models/Trousseau');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.register = async (req, res) => {
    const { username, email, password } = req.body;

    try {
        let user = await User.findOne({ email });

        if (user) {
            return res.status(400).json({ msg: 'User already exists' });
        }

        user = new User({
            username,
            email,
            password
        });

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);

        await user.save();

        const payload = {
            user: {
                id: user.id
            }
        };

        jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: 360000 },
            (err, token) => {
                if (err) throw err;
                res.json({ token });
            }
        );
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

exports.login = async (req, res) => {
    const { email, password } = req.body;

    try {
        let user = await User.findOne({ email });

        if (!user) {
            return res.status(400).json({ msg: 'Invalid Credentials' });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(400).json({ msg: 'Invalid Credentials' });
        }

        const payload = {
            user: {
                id: user.id,
                username: user.username, // Assurez-vous que username est inclus dans le payload
            },
        };

        jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: 3600 },
            (err, token) => {
                if (err) throw err;
                res.json({ token, username: user.username });
            }
        );
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

exports.getUserInvitations = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            console.log('Utilisateur non trouvé');
            return res.status(404).json({ message: 'Utilisateur non trouvé' });
        }

        console.log('Utilisateur trouvé :', user.email);

        const populatedUser = await User.findById(req.user.id).populate('invitations.trousseauId', 'name');
        console.log('Utilisateur avec invitations peuplées :', JSON.stringify(populatedUser, null, 2));

        const invitations = populatedUser.invitations.map(inv => ({
            trousseauId: inv.trousseauId._id,
            trousseauName: inv.trousseauId.name
        }));

        console.log('Invitations transformées :', invitations);

        res.json(invitations);
    } catch (err) {
        console.error('Erreur de récupération des invitations:', err.message);
        res.status(500).send('Server error');
    }
};





