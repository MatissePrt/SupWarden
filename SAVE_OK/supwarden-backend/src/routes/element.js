const express = require('express');
const router = express.Router();
const elementController = require('../controllers/elementController');
const auth = require('../middleware/auth');

router.post('/:trousseauId/elements', auth, elementController.addElement);
router.get('/:trousseauId/elements', auth, elementController.getElementsByTrousseau);
router.post('/details/:elementId', auth, elementController.getElementDetails);

module.exports = router;
