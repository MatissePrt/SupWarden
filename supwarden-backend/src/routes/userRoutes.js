const express = require('express');
const router = express.Router();
const { register, login, getUserInvitations, googleLogin, changePassword } = require('../controllers/userController');
const auth = require('../middleware/auth');

router.post('/register', register);
router.post('/login', login);
router.post('/change-password', auth, changePassword);  // Nouvelle route pour changer le mot de passe
router.get('/invitations', auth, getUserInvitations);
router.post('/google-login', googleLogin);

module.exports = router;
