const express = require('express');
const router = express.Router();
const { createLink, getLinkBySlug, getUserLinks } = require('../controllers/linkController');

const authenticate = require('../middleware/authMiddleware');

// Create a new smart link
router.post('/', authenticate, createLink);

// Get all links for a user
router.get('/', authenticate, getUserLinks);

// Get a single link by slug
router.get('/:slug', getLinkBySlug);

module.exports = router;
