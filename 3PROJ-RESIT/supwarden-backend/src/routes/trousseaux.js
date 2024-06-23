const express = require('express');
const router = express.Router();
const { createTrousseau, updateTrousseau, deleteTrousseau, getAllTrousseaux, addMember, getTrousseauById, inviteMember, respondToInvitation  } = require('../controllers/trousseauController');
const auth = require('../middleware/auth');

router.post('/create', auth, createTrousseau);
router.post('/update', auth, updateTrousseau);
router.post('/delete', auth, deleteTrousseau);
router.post('/addMember', auth, addMember); 
router.get('/:id', auth, getTrousseauById); 
router.post('/inviteMember', auth, inviteMember); 
router.post('/respondToInvitation', auth, respondToInvitation); 
router.get('/', auth, getAllTrousseaux);

module.exports = router;
