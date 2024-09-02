const Message = require('../models/Message');

exports.sendMessage = async (req, res) => {
    const { trousseauId } = req.params;
    const { content } = req.body;

    try {
        const message = new Message({
            content,
            trousseau: trousseauId,
            sender: req.user.id,
            timestamp: new Date(),
        });

        await message.save();

        res.status(201).json({ success: true, message: 'Message envoyé', data: message });
    } catch (error) {
        console.error('Erreur lors de l\'envoi du message:', error);
        res.status(500).json({ success: false, message: 'Erreur lors de l\'envoi du message' });
    }
};

exports.getMessagesByTrousseau = async (req, res) => {
    const { trousseauId } = req.params;

    try {
        const messages = await Message.find({ trousseau: trousseauId })
            .populate('sender', 'username') // Assurez-vous que 'sender' est bien la clé utilisée dans votre schéma
            .sort({ createdAt: 1 });

        res.status(200).json(messages); // Renvoie les messages avec un status 200
    } catch (error) {
        console.error('Erreur lors de la récupération des messages:', error);
        res.status(500).json({ message: 'Erreur lors de la récupération des messages' });
    }
};
    