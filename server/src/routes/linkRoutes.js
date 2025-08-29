const express = require('express');
const router = express.Router();
const { createLink, getLinkBySlug, getUserLinks } = require('../controllers/linkController');

// Create a new smart link
router.post('/', createLink);

// Get all links for a user
router.get('/', getUserLinks);

// Get a single link by slug
router.get('/:slug', getLinkBySlug);

module.exports = router;
