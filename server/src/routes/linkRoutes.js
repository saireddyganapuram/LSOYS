const express = require('express');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');
const { createLink, getLinkBySlug, getUserLinks } = require('../controllers/linkController');

const authenticate = require('../middleware/authMiddleware');

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Create a new smart link
router.post('/', authenticate, createLink);

// Get all links for a user
router.get('/', authenticate, getUserLinks);

// Update a link
router.put('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, artist, slug } = req.body;
    const userId = req.user.id;

    // Validate required fields
    if (!title || !artist || !slug) {
      return res.status(400).json({ error: 'Title, artist, and slug are required' });
    }

    // Check if link exists and belongs to user
    const { data: existingLink, error: linkError } = await supabase
      .from('links')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (linkError || !existingLink) {
      return res.status(404).json({ error: 'Link not found or access denied' });
    }

    // Check if slug is already taken by another link
    if (slug !== existingLink.slug) {
      const { data: slugExists, error: slugError } = await supabase
        .from('links')
        .select('id')
        .eq('slug', slug)
        .neq('id', id)
        .single();

      if (slugExists) {
        return res.status(400).json({ error: 'Slug already taken' });
      }
    }

    // Update the link
    const { data: updatedLink, error: updateError } = await supabase
      .from('links')
      .update({
        title,
        artist,
        slug,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating link:', updateError);
      return res.status(500).json({ error: 'Failed to update link' });
    }

    res.json(updatedLink);

  } catch (error) {
    console.error('Update link error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Delete a link
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Check if link exists and belongs to user
    const { data: existingLink, error: linkError } = await supabase
      .from('links')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (linkError || !existingLink) {
      return res.status(404).json({ error: 'Link not found or access denied' });
    }

    // Delete the link (cascade will handle related records)
    const { error: deleteError } = await supabase
      .from('links')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (deleteError) {
      console.error('Error deleting link:', deleteError);
      return res.status(500).json({ error: 'Failed to delete link' });
    }

    res.json({ message: 'Link deleted successfully' });

  } catch (error) {
    console.error('Delete link error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get a single link by slug (must be after ID routes to avoid conflicts)
router.get('/:slug', getLinkBySlug);

module.exports = router;
