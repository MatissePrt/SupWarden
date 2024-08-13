const Element = require('../models/Element');
const User = require('../models/User');
const { encryptPassword, decryptPassword } = require('../utils/encryption');
const bcrypt = require('bcryptjs');

// Fonction utilitaire pour gérer les pièces jointes
const handleAttachments = (req, element) => {
    if (req.files && req.files.length > 0) {
        element.attachments = req.files.map(file => ({
            filename: file.originalname,
            data: file.buffer,
            contentType: file.mimetype,
        }));
    } else if (req.body.attachmentsRemoved === 'true') {
        element.attachments = [];
    } else {
        if (req.body.customFields) {
            const customFields = JSON.parse(req.body.customFields);
            const existingFileNames = customFields.filter(field => field.key === 'file').map(field => field.value);
            element.attachments = element.attachments.filter(attachment => existingFileNames.includes(attachment.filename));
        }
    }
};

// Fonction utilitaire pour gérer la mise à jour du mot de passe
const handlePasswordUpdate = (req, element) => {
    if (req.body.password && req.body.password.trim() !== '') {
        element.password = req.body.password; // Assigner directement le mot de passe non chiffré
    }
};

// Fonction utilitaire pour gérer les champs personnalisés
const handleCustomFieldsUpdate = (req, element) => {
    element.customFields = req.body.customFields ? JSON.parse(req.body.customFields) : element.customFields;
};

exports.getElements = async (req, res) => {
    try {
        const { trousseauId } = req.params;
        if (!trousseauId) {
            return res.status(400).json({ message: 'ID du trousseau non défini' });
        }
        const elements = await Element.find({ trousseau: trousseauId });
        res.json(elements);
    } catch (error) {
        res.status(500).json({ message: 'Erreur récupération des éléments' });
    }
};

exports.createElement = async (req, res) => {
    const { name, username, password, uris, note, sensitive, trousseau, customFields } = req.body;

    try {
        const newElement = new Element({
            name,
            username,
            password,
            uris: uris ? JSON.parse(uris) : [],
            note,
            sensitive,
            trousseau,
            customFields: customFields ? JSON.parse(customFields) : [],
        });

        handleAttachments(req, newElement); // Gérer les pièces jointes

        await newElement.save();
        res.status(201).json(newElement);
    } catch (error) {
        console.warn('Erreur création de l\'élément:', error);
        res.status(500).json({ message: 'Erreur création de l\'élément' });
    }
};

exports.deleteElement = async (req, res) => {
    try {
        const element = await Element.findByIdAndDelete(req.params.elementId);
        if (!element) {
            return res.status(404).json({ message: 'Élément non trouvé' });
        }
        res.json({ success: true, message: 'Élément supprimé' });
    } catch (error) {
        res.status(500).json({ message: 'Erreur suppression de l\'élément' });
    }
};

exports.updateElement = async (req, res) => {
    try {
        const element = await Element.findById(req.params.elementId);
        if (!element) {
            return res.status(404).json({ message: 'Élément non trouvé' });
        }

        element.name = req.body.name || element.name;
        element.username = req.body.username || element.username;
        element.uris = req.body.uris ? JSON.parse(req.body.uris) : element.uris;
        element.note = req.body.note || element.note;
        element.sensitive = req.body.sensitive === 'true';

        handlePasswordUpdate(req, element); // Gérer la mise à jour du mot de passe
        handleAttachments(req, element); // Gérer les pièces jointes
        handleCustomFieldsUpdate(req, element); // Gérer les champs personnalisés

        await element.save(); // Le pré-save chiffrera le mot de passe ici

        res.json({ success: true, element });
    } catch (error) {
        console.error('Erreur modification de l\'élément:', error);
        res.status(500).json({ message: 'Erreur modification de l\'élément' });
    }
};

exports.getElementDetails = async (req, res) => {
    const { id } = req.params;
    const { password } = req.body;

    try {
        const element = await Element.findById(id);
        if (!element) {
            return res.status(404).json({ message: 'Élément non trouvé' });
        }

        if (element.sensitive) {
            const user = await User.findById(req.user.id);
            if (!password) {
                return res.status(400).json({ message: 'Mot de passe requis' });
            }
            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                return res.status(401).json({ message: 'Mot de passe incorrect' });
            }
        }

        element.password = decryptPassword(element.password); // Déchiffrement du mot de passe

        res.json(element);
    } catch (error) {
        res.status(500).json({ message: 'Erreur récupération de l\'élément' });
    }
};
