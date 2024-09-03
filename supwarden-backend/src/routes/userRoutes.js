const express = require('express');
const router = express.Router();
const { register, login, getUserInvitations, googleLogin, changePassword, setPin } = require('../controllers/userController');
const auth = require('../middleware/auth');

router.post('/register', register);
router.post('/login', login);
router.post('/change-password', auth, changePassword);
router.get('/invitations', auth, getUserInvitations);
router.post('/google-login', googleLogin);
router.post('/set-pin', auth, setPin);

module.exports = router;
