const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { sendMessage, getMessagesByTrousseau } = require('../controllers/messageController');

router.post('/:trousseauId', auth, sendMessage);
router.get('/:trousseauId', auth, getMessagesByTrousseau);

module.exports = router;
