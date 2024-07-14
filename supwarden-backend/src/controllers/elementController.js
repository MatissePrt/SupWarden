// src/controllers/elementController.js

const Element = require('../models/Element');
const User = require('../models/User'); // Assurez-vous que User est importé
const { decryptPassword } = require('../utils/encryption');
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
        const newElement = new Element({
            name,
            username,
            password,
            uris: JSON.parse(uris), // Parse URIs
            note,
            sensitive,
            trousseau,
            customFields: JSON.parse(customFields), // Parse custom fields
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
        const element = await Element.findByIdAndUpdate(req.params.elementId, req.body, { new: true });
        if (!element) {
            return res.status(404).json({ message: 'Élément non trouvé' });
        }
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
            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                return res.status(401).json({ message: 'Mot de passe incorrect' });
            }
        }
        
        element.password = decryptPassword(element.password);
        
        res.json(element);
    } catch (error) {
        console.warn('Erreur récupération de l\'élément:', error);
        res.status(500).json({ message: 'Erreur récupération de l\'élément' });
    }
};
