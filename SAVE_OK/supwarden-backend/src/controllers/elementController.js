const Trousseau = require('../models/Trousseau');
const Element = require('../models/Element');
const crypto = require('crypto');

exports.addElement = async (req, res) => {
    const { trousseauId } = req.params;
    const { name, username, password, uri, note, customFields } = req.body;

    try {
        const trousseau = await Trousseau.findById(trousseauId);
        if (!trousseau) {
            return res.status(404).json({ message: 'Trousseau non trouvé' });
        }

        const newElement = new Element({
            name,
            username,
            password,
            uri,
            note,
            customFields: customFields || [],
            trousseau: trousseauId,
        });

        const element = await newElement.save();

        trousseau.elements.push(element._id);
        await trousseau.save();

        res.json({ success: true, element });
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server error');
    }
};

exports.getElementsByTrousseau = async (req, res) => {
    const { trousseauId } = req.params;

    try {
        const elements = await Element.find({ trousseau: trousseauId });
        res.json({ success: true, elements });
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server error');
    }
};

exports.getElementDetails = async (req, res) => {
    const { elementId } = req.params;

    try {
        const element = await Element.findById(elementId);
        if (!element) {
            return res.status(404).json({ message: 'Element non trouvé' });
        }

        const algorithm = 'aes-256-cbc';
        const key = process.env.SECRET_KEY.slice(0, 32);
        const [iv, encryptedText] = element.password.split(':');
        const decipher = crypto.createDecipheriv(algorithm, Buffer.from(key), Buffer.from(iv, 'hex'));
        let decrypted = decipher.update(Buffer.from(encryptedText, 'hex'));
        decrypted = Buffer.concat([decrypted, decipher.final()]);

        res.json({ success: true, decryptedPassword: decrypted.toString() });
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server error');
    }
};
