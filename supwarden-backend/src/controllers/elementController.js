const Element = require('../models/Element');
const User = require('../models/User');
const { encryptPassword, decryptPassword } = require('../utils/encryption');
const bcrypt = require('bcryptjs');

exports.getElements = async (req, res) => {
    try {
        const { trousseauId } = req.params;
        if (!trousseauId) {
            return res.status(400).json({ message: 'ID du trousseau non défini' });
        }
        const elements = await Element.find({ trousseau: trousseauId });
        res.json(elements);
    } catch (error) {
        console.error('Erreur récupération des éléments:', error);
        res.status(500).json({ message: 'Erreur récupération des éléments' });
    }
};

exports.createElement = async (req, res) => {
    const { name, username, password, uris, note, sensitive, trousseau, customFields } = req.body;

    try {
        const encryptedPassword = password ? encryptPassword(password) : undefined;

        const newElement = new Element({
            name,
            username,
            password: encryptedPassword,
            uris: uris ? JSON.parse(uris) : [],
            note,
            sensitive,
            trousseau,
            customFields: customFields ? JSON.parse(customFields) : [],
        });

        if (req.files && req.files.length > 0) {
            newElement.attachments = req.files.map(file => ({
                filename: file.originalname,
                data: file.buffer,
                contentType: file.mimetype,
            }));
        }

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
        console.error('Erreur suppression de l\'élément:', error);
        res.status(500).json({ message: 'Erreur suppression de l\'élément' });
    }
};

exports.updateElement = async (req, res) => {
    try {
        console.log('Données reçues:', req.body);
        console.log('Fichiers reçus:', req.files);

        const element = await Element.findById(req.params.elementId);

        if (!element) {
            return res.status(404).json({ message: 'Élément non trouvé' });
        }

        // Mise à jour des champs de l'élément
        element.name = req.body.name || element.name;
        element.username = req.body.username || element.username;

        // Si le mot de passe est fourni, il doit être chiffré
        if (req.body.password) {
            element.password = encryptPassword(req.body.password);
        }

        element.uris = req.body.uris ? JSON.parse(req.body.uris) : element.uris;
        element.note = req.body.note || element.note;
        element.sensitive = req.body.sensitive === 'true';
        element.customFields = req.body.customFields ? JSON.parse(req.body.customFields) : element.customFields;

        // Gestion des pièces jointes
        if (req.files && req.files.length > 0) {
            element.attachments = req.files.map(file => ({
                filename: file.originalname,
                data: file.buffer,
                contentType: file.mimetype,
            }));
        } else {
            // Supprimer les fichiers joints s'ils ne sont plus présents
            if (req.body.customFields) {
                const customFields = JSON.parse(req.body.customFields);
                const existingFileNames = customFields.filter(field => field.key === 'file').map(field => field.value);

                // Supprimer les fichiers qui ne sont plus dans customFields
                element.attachments = element.attachments.filter(attachment => existingFileNames.includes(attachment.filename));
            }
        }

        await element.save();

        console.log('Élément mis à jour:', element);
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
        
        try {
            console.log('Mot de passe chiffré avant décryptage:', element.password);
            const decryptedPassword = decryptPassword(element.password);
            console.log('Mot de passe déchiffré:', decryptedPassword);
            element.password = decryptedPassword;
        } catch (error) {
            console.error('Erreur lors de la décryption:', error.message);
            // On ne retourne pas le mot de passe s'il y a une erreur dans la décryption
            return res.status(500).json({ message: 'Erreur lors de la décryption du mot de passe' });
        }

        res.json(element);
    } catch (error) {
        console.warn('Erreur récupération de l\'élément:', error);
        res.status(500).json({ message: 'Erreur récupération de l\'élément' });
    }
};
