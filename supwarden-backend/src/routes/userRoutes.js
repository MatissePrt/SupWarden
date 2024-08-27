const express = require('express');
const router = express.Router();
const { register, login, getUserInvitations, googleLogin } = require('../controllers/userController');
const auth = require('../middleware/auth');

router.post('/register', register);
router.post('/login', login);
router.get('/invitations', auth, getUserInvitations);
router.post('/google-login', googleLogin);


module.exports = router;
