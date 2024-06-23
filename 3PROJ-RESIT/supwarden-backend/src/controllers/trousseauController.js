const Trousseau = require('../models/Trousseau');
const User = require('../models/User');

exports.createTrousseau = async (req, res) => {
    const { name, description } = req.body;
    const userId = req.user.id;

    try {
        const newTrousseau = new Trousseau({
            name,
            description,
            owner: userId,
            members: [userId],
        });

        const trousseau = await newTrousseau.save();
        res.json(trousseau);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

exports.updateTrousseau = async (req, res) => {
    const { id, name, description } = req.body;

    try {
        let trousseau = await Trousseau.findById(id);

        if (!trousseau) {
            return res.status(404).json({ message: 'Trousseau non trouvé' });
        }

        trousseau.name = name || trousseau.name;
        trousseau.description = description || trousseau.description;

        await trousseau.save();
        res.json(trousseau);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

exports.deleteTrousseau = async (req, res) => {
    const { id } = req.body;

    try {
        let trousseau = await Trousseau.findById(id);

        if (!trousseau) {
            return res.status(404).json({ message: 'Trousseau non trouvé' });
        }

        await trousseau.remove();
        res.json({ message: 'Trousseau supprimé avec succès' });
    } catch (err) {
        console.error(err.message);
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

exports.getTrousseauById = async (req, res) => {
    try {
        const trousseau = await Trousseau.findById(req.params.id);
        if (!trousseau) {
            return res.status(404).json({ message: 'Trousseau non trouvé' });
        }
        res.json(trousseau);
    } catch (err) {
        console.error(err.message);
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
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: 'Utilisateur non trouvé' });
        }

        const trousseau = await Trousseau.findById(trousseauId).populate('members', 'email');
        if (!trousseau) {
            return res.status(404).json({ message: 'Trousseau non trouvé' });
        }

        const invitationIndex = trousseau.invitations.findIndex(invitation => invitation.email === user.email);
        if (invitationIndex === -1) {
            return res.status(404).json({ message: 'Invitation non trouvée' });
        }

        if (response === 'accepted') {
            if (!trousseau.members.some(member => member.equals(user._id))) {
                trousseau.members.push(user._id);
            }
        }

        trousseau.invitations.splice(invitationIndex, 1);
        await trousseau.save();

        const userInvitationIndex = user.invitations.findIndex(inv => inv.trousseauId.equals(trousseauId));
        if (userInvitationIndex !== -1) {
            user.invitations.splice(userInvitationIndex, 1);
            await user.save();
        }

        res.json({ message: 'Réponse à l\'invitation enregistrée' });
    } catch (err) {
        res.status(500).send('Server error');
    }
};











