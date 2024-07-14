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
        res.status(500).send('Erreur serveur');
    }
};

exports.deleteTrousseau = async (req, res) => {
    try {
        const trousseau = await Trousseau.findById(req.params.id);

        if (!trousseau) {
            return res.status(404).json({ message: 'Trousseau non trouvé' });
        }

        // Vérifiez si l'utilisateur est le propriétaire du trousseau
        if (trousseau.owner.toString() !== req.user.id) {
            return res.status(401).json({ message: 'Non autorisé' });
        }

        await Trousseau.deleteOne({ _id: req.params.id });

        res.json({ success: true, message: 'Trousseau supprimé' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Erreur serveur' });
    }
};


exports.addMember = async (req, res) => {
    const { trousseauId, memberId } = req.body;

    try {
        const trousseau = await Trousseau.findById(trousseauId);
        if (!trousseau) {
            return res.status(404).json({ message: 'Trousseau non trouvé' });
        }

        // Vérifiez si le membre est déjà dans les membres
        const alreadyMember = trousseau.members.includes(memberId);
        if (alreadyMember) {
            return res.status(400).json({ message: 'Utilisateur déjà membre' });
        }

        // Vérifiez si le membre a déjà été invité
        const alreadyInvited = trousseau.invitations.some(invitation => invitation.email === req.body.email);
        if (alreadyInvited) {
            return res.status(400).json({ message: 'Utilisateur déjà invité' });
        }

        trousseau.invitations.push({ email: req.body.email, status: 'pending' });
        await trousseau.save();

        console.log('Updated trousseau with new invitation:', trousseau); // Log ajoutée

        res.json({ success: true, message: 'Invitation envoyée avec succès' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Erreur serveur');
    }
};


exports.getTrousseaux = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).populate('personalTrousseau');
        if (!user) {
            return res.status(404).json({ success: false, message: 'Utilisateur non trouvé' });
        }

        const trousseaux = await Trousseau.find({ members: user._id });
        return res.json({ success: true, personalTrousseau: user.personalTrousseau, trousseaux });
    } catch (err) {
        console.error('Server error:', err.message);
        return res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
};

exports.getTrousseauById = async (req, res) => {
    try {
        const trousseau = await Trousseau.findById(req.params.id).populate('members', 'email'); // Suppression de la population des invitations
        if (!trousseau) {
            return res.status(404).json({ message: 'Trousseau non trouvé' });
        }
        console.log('Fetched trousseau with invitations:', trousseau); // Log ajoutée
        res.json(trousseau);
    } catch (error) {
        console.error('Erreur de récupération du trousseau:', error.message);
        res.status(500).send('Erreur serveur');
    }
};


exports.inviteMember = async (req, res) => {
    const { trousseauId, email } = req.body;

    try {
        const trousseau = await Trousseau.findById(trousseauId).populate('members', 'email');
        if (!trousseau) {
            return res.status(404).json({ message: 'Trousseau non trouvé' });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'Utilisateur non trouvé' });
        }

        const alreadyMember = trousseau.members.some(member => member.email === email);
        if (alreadyMember) {
            return res.status(400).json({ message: 'Utilisateur déjà membre' });
        }

        const alreadyInvited = trousseau.invitations.some(invitation => invitation.email === email);
        if (alreadyInvited) {
            return res.status(400).json({ message: 'Utilisateur déjà invité' });
        }

        trousseau.invitations.push({ email, status: 'pending' });
        user.invitations.push({ trousseauId, status: 'pending' });

        await trousseau.save();
        await user.save();

        res.json({ success: true, message: 'Invitation envoyée avec succès' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Erreur serveur');
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

        const invitationIndex = user.invitations.findIndex(inv => inv.trousseauId.toString() === trousseauId);
        if (invitationIndex === -1) {
            return res.status(404).json({ success: false, message: 'Invitation non trouvée' });
        }

        user.invitations.splice(invitationIndex, 1);

        if (response === 'accepted') {
            trousseau.members.push(user._id);
        }

        const trousseauInvitationIndex = trousseau.invitations.findIndex(inv => inv.email === user.email);
        if (trousseauInvitationIndex !== -1) {
            trousseau.invitations.splice(trousseauInvitationIndex, 1);
        }

        await user.save();
        await trousseau.save();

        res.json({ success: true, message: 'Réponse à l\'invitation enregistrée' });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
};

