const express = require('express');
const router = express.Router();
const { createTrousseau, deleteTrousseau, getTrousseaux, addMember, getTrousseauById, inviteMember, respondToInvitation, exportTrousseaux, importTrousseau } = require('../controllers/trousseauController');
const auth = require('../middleware/auth');

router.get('/export', auth, exportTrousseaux);
router.post('/import', auth, importTrousseau);
router.post('/create', auth, createTrousseau);
router.delete('/:id', auth, deleteTrousseau);
router.post('/addMember', auth, addMember);
router.get('/:id', auth, getTrousseauById);
router.post('/inviteMember', auth, inviteMember);
router.post('/respondToInvitation', auth, respondToInvitation);
router.get('/', auth, getTrousseaux);

module.exports = router;
