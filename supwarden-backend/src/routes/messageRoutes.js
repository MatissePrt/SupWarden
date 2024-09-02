const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { sendMessage, getMessagesByTrousseau } = require('../controllers/messageController');

router.post('/:trousseauId', auth, sendMessage);
router.get('/:trousseauId', auth, getMessagesByTrousseau); // Mise à jour de la route GET pour qu'elle corresponde à ce qui est appelé dans le front-end

module.exports = router;
