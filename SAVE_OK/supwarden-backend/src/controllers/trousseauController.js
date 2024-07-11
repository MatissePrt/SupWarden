const Trousseau = require('../models/Trousseau');
const User = require('../models/User');
const Element = require('../models/Element');
const mongoose = require('mongoose');


exports.createTrousseau = async (req, res) => {
    const { name, description } = req.body;

    try {
        const newTrousseau = new Trousseau({
            name,
            description,
            owner: req.user.id,
            members: [req.user.id]
        });

        const trousseau = await newTrousseau.save();
        res.json(trousseau);
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server error');
    }
};

exports.deleteTrousseau = async (req, res) => {
    try {
        const trousseau = await Trousseau.findById(req.params.id);

        if (!trousseau) {
            return res.status(404).json({ message: 'Trousseau non trouvé' });
        }

        if (trousseau.owner.toString() !== req.user.id) {
            return res.status(401).json({ message: 'Utilisateur non autorisé' });
        }

        await trousseau.remove();
        res.json({ message: 'Trousseau supprimé' });
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server error');
    }
};

exports.getAllTrousseaux = async (req, res) => {
    try {
        const trousseaux = await Trousseau.find({ members: req.user.id });
        res.json(trousseaux);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

exports.addMember = async (req, res) => {
    const { trousseauId, memberId } = req.body;

    try {
        const trousseau = await Trousseau.findById(trousseauId);
        if (!trousseau) {
            return res.status(404).json({ message: 'Trousseau non trouvé' });
        }

        const user = await User.findById(memberId);
        if (!user) {
            return res.status(404).json({ message: 'Utilisateur non trouvé' });
        }

        if (!trousseau.members.includes(memberId)) {
            trousseau.members.push(memberId);
            await trousseau.save();
            return res.json({ message: 'Membre ajouté avec succès' });
        } else {
            return res.status(400).json({ message: 'L\'utilisateur est déjà membre du trousseau' });
        }
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

exports.getTrousseaux = async (req, res) => {
    try {
        const trousseaux = await Trousseau.find({ members: req.user.id });
        res.json(trousseaux);
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server error');
    }
};

exports.getTrousseauById = async (req, res) => {
    try {
        const trousseau = await Trousseau.findById(req.params.id).populate('members', 'username email');
        if (!trousseau) {
            return res.status(404).json({ message: 'Trousseau non trouvé' });
        }
        res.json(trousseau);
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server error');
    }
};

exports.inviteMember = async (req, res) => {
    const { trousseauId, email } = req.body;

    try {
        const trousseau = await Trousseau.findById(trousseauId);
        if (!trousseau) {
            return res.status(404).json({ message: 'Trousseau non trouvé' });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'Utilisateur non trouvé' });
        }

        console.log(`Utilisateur trouvé pour invitation: ${user.email}`);

        // Vérifier si l'utilisateur est déjà membre ou invité
        const isMember = trousseau.members.includes(user._id);
        const isInvited = trousseau.invitations.some(inv => inv.email === email);

        if (isMember) {
            return res.status(400).json({ message: 'L\'utilisateur est déjà membre du trousseau' });
        }

        if (isInvited) {
            return res.status(400).json({ message: 'L\'utilisateur a déjà été invité au trousseau' });
        }

        // Ajouter l'invitation au trousseau
        trousseau.invitations.push({ email });
        await trousseau.save();
        console.log(`Invitation ajoutée au trousseau: ${trousseau.invitations}`);

        // Ajouter l'invitation à l'utilisateur
        user.invitations.push({ trousseauId });
        await user.save();
        console.log(`Invitation ajoutée à l'utilisateur: ${user.invitations}`);

        res.json({ message: 'Invitation envoyée' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

exports.respondToInvitation = async (req, res) => {
    const { trousseauId, response } = req.body;
    try {
        const trousseau = await Trousseau.findById(trousseauId);
        if (!trousseau) {
            return res.status(404).json({ success: false, message: 'Trousseau non trouvé' });
        }

        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ success: false, message: 'Utilisateur non trouvé' });
        }

        const invitation = user.invitations.find(inv => inv.trousseauId.toString() === trousseauId);
        if (!invitation) {
            return res.status(404).json({ success: false, message: 'Invitation non trouvée' });
        }

        // Update the invitation status
        invitation.status = response;

        if (response === 'accepted') {
            trousseau.members.push(user._id);
            await trousseau.save();
        }

        // Remove the invitation from the user
        user.invitations = user.invitations.filter(inv => inv.trousseauId.toString() !== trousseauId);
        await user.save();

        res.json({ success: true, message: 'Réponse à l\'invitation enregistrée' });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
};