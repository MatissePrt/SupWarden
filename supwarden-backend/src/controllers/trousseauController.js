const Trousseau = require('../models/Trousseau');
const User = require('../models/User');
const Element = require('../models/Element');
const { decryptPassword } = require('../utils/encryption');

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

        if (!trousseau || trousseau.owner.toString() !== req.user.id) {
            return res.status(404).json({ message: 'Trousseau non trouvé ou non autorisé' });
        }

        await Trousseau.deleteOne({ _id: req.params.id });

        res.json({ success: true, message: 'Trousseau supprimé' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Erreur serveur' });
    }
};

exports.addMember = async (req, res) => {
    const { trousseauId, memberId, email } = req.body;

    try {
        const trousseau = await Trousseau.findById(trousseauId);
        if (!trousseau) {
            return res.status(404).json({ message: 'Trousseau non trouvé' });
        }

        if (trousseau.members.includes(memberId) || trousseau.invitations.some(invitation => invitation.email === email)) {
            return res.status(400).json({ message: 'Utilisateur déjà membre ou invité' });
        }

        trousseau.invitations.push({ email, status: 'pending' });
        await trousseau.save();

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
        const trousseau = await Trousseau.findById(req.params.id).populate('members', 'email username');
        if (!trousseau) {
            return res.status(404).json({ message: 'Trousseau non trouvé' });
        }
        res.json({ success: true, trousseau });
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

        // Vérifier si l'utilisateur existe
        if (!user) {
            return res.status(404).json({ message: 'Utilisateur non trouvé' });
        }

        // Vérifier si l'utilisateur est déjà membre
        if (trousseau.members.some(member => member.email === email)) {
            return res.status(400).json({ message: 'Utilisateur déjà membre' });
        }

        // Vérifier si l'utilisateur est déjà invité
        if (trousseau.invitations.some(invitation => invitation.email === email)) {
            return res.status(400).json({ message: 'Utilisateur déjà invité' });
        }

        // Ajouter l'invitation si tout est correct
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
        const user = await User.findById(req.user.id);

        if (!trousseau || !user) {
            return res.status(404).json({ success: false, message: 'Trousseau ou utilisateur non trouvé' });
        }

        const invitationIndex = user.invitations.findIndex(inv => inv.trousseauId.toString() === trousseauId);
        if (invitationIndex === -1) {
            return res.status(404).json({ success: false, message: 'Invitation non trouvée' });
        }

        user.invitations.splice(invitationIndex, 1);

        if (response === 'accepted') {
            trousseau.members.push(user._id);
        }

        trousseau.invitations = trousseau.invitations.filter(inv => inv.email !== user.email);

        await user.save();
        await trousseau.save();

        res.json({ success: true, message: 'Réponse à l\'invitation enregistrée' });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
};

exports.exportTrousseaux = async (req, res) => {
    try {
        // Trouver les trousseaux appartenant à l'utilisateur connecté
        const trousseaux = await Trousseau.find({ owner: req.user.id });

        // Inclure les éléments pour chaque trousseau
        const exportData = await Promise.all(trousseaux.map(async (trousseau) => {
            const elements = await Element.find({ trousseau: trousseau._id, creatorId: req.user.id });
            return {
                name: trousseau.name,
                description: trousseau.description,
                elements: elements.map(element => ({
                    name: element.name,
                    username: element.username,
                    password: element.password,
                    uris: element.uris,
                    note: element.note,
                    sensitive: element.sensitive,
                    customFields: element.customFields,
                    attachments: element.attachments.map(att => ({
                        filename: att.filename,
                        contentType: att.contentType,
                        // Ne pas inclure les données binaires dans l'export JSON
                    }))
                }))
            };
        }));

        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Content-Disposition', 'attachment; filename=mes_trousseaux.json');
        res.send(JSON.stringify(exportData, null, 2));
    } catch (error) {
        console.error('Erreur lors de l\'exportation des trousseaux:', error);
        res.status(500).send('Erreur serveur');
    }
};

exports.importTrousseau = async (req, res) => {
    try {
        const data = req.body;

        for (const trousseauData of data) {
            let newTrousseau = await Trousseau.findOne({ name: trousseauData.name, owner: req.user.id });

            if (!newTrousseau) {
                newTrousseau = new Trousseau({
                    name: trousseauData.name,
                    description: trousseauData.description,
                    owner: req.user.id,
                    members: [req.user.id],
                    elements: []
                });
                await newTrousseau.save();
            }

            for (const elementData of trousseauData.elements) {
                const newElement = new Element({
                    ...elementData,
                    trousseau: newTrousseau._id,
                    creatorId: req.user.id,
                    editors: [req.user.id],  // S'assurer que l'utilisateur peut modifier l'élément
                });

                // Décryptage du mot de passe avant de l'enregistrer à nouveau
                newElement.password = decryptPassword(newElement.password);

                await newElement.save();
                newTrousseau.elements.push(newElement._id);
            }

            await newTrousseau.save();
        }

        res.status(201).json({ success: true, message: 'Importation réussie' });
    } catch (error) {
        console.error('Erreur lors de l\'importation:', error.message);
        res.status(500).json({ success: false, message: 'Erreur lors de l\'importation' });
    }
};
