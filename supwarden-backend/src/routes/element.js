// src/routes/element.js

const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const multer = require('multer');
const storage = multer.memoryStorage();
const upload = multer({ storage });

const { createElement, getElements, deleteElement, updateElement, getElementDetails } = require('../controllers/elementController');

router.post('/', auth, upload.array('files'), createElement); // Ajout de upload.array('files')
router.get('/:trousseauId', auth, getElements);
router.delete('/:elementId', auth, deleteElement);
router.put('/:elementId', auth, upload.array('files'), updateElement);
router.post('/:id/details', auth, getElementDetails);

module.exports = router;
