const express = require('express');
const router = express.Router();
const { register, login } = require('../controllers/userController');
const { getUserInvitations } = require('../controllers/userController');
const auth = require('../middleware/auth');

router.post('/register', register);
router.post('/login', login);
router.get('/invitations', auth, getUserInvitations); 

module.exports = router;
