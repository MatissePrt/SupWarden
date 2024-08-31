const Element = require('../models/Element');
const User = require('../models/User');
const { decryptPassword } = require('../utils/encryption');
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
        const customFields = JSON.parse(req.body.customFields || '[]');
        const existingFileNames = customFields.filter(field => field.key === 'file').map(field => field.value);
        element.attachments = element.attachments.filter(attachment => existingFileNames.includes(attachment.filename));
    }
};

// Fonction utilitaire pour gérer la mise à jour du mot de passe
const handlePasswordUpdate = (req, element) => {
    if (req.body.password?.trim()) {
        element.password = req.body.password;
    }
};

// Fonction utilitaire pour gérer les champs personnalisés
const handleCustomFieldsUpdate = (req, element) => {
    const customFields = [];

    if (req.body.customFields) {
        const parsedFields = JSON.parse(req.body.customFields);

        parsedFields.forEach((field, index) => {
            if (field.key === 'file' && req.files && req.files.length > 0) {
                const file = req.files[index];
                if (file) {
                    customFields.push({
                        key: field.key,
                        value: {
                            filename: file.originalname,
                            data: file.buffer,
                            contentType: file.mimetype,
                        }
                    });
                }
            } else {
                customFields.push(field);
            }
        });
    }

    element.customFields = customFields;
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
    const { name, username, password, uris, note, sensitive, trousseau, editors } = req.body;

    try {
        const newElement = new Element({
            name,
            username,
            password,
            uris: uris ? JSON.parse(uris) : [],
            note,
            sensitive,
            trousseau,
            customFields: [],
            editors: editors ? JSON.parse(editors) : [req.user.id],
            creatorId: req.user.id,
        });

        handleAttachments(req, newElement);
        handleCustomFieldsUpdate(req, newElement);

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

        // Vérification des droits de modification
        if (!element.editors.includes(req.user.id)) {
            return res.status(403).json({ message: 'Vous n\'avez pas les droits pour modifier cet élément' });
        }

        element.name = req.body.name || element.name;
        element.username = req.body.username || element.username;
        element.uris = JSON.parse(req.body.uris || '[]');
        element.note = req.body.note || element.note;
        element.sensitive = req.body.sensitive === 'true';

        handlePasswordUpdate(req, element);
        handleAttachments(req, element);
        handleCustomFieldsUpdate(req, element);

        if (req.body.editors) {
            element.editors = JSON.parse(req.body.editors);
        }

        await element.save();
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

        // Assurez-vous de déchiffrer le mot de passe avant l'affichage
        element.password = decryptPassword(element.password);

        res.json(element);
    } catch (error) {
        res.status(500).json({ message: 'Erreur récupération de l\'élément' });
    }
};
