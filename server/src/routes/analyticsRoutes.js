const express = require('express');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Get analytics for a link
router.get('/:linkId', async (req, res) => {
  try {
    const { linkId } = req.params;
    
    console.log('Getting analytics for link:', linkId);

    // Get the link details first
    const { data: link, error: linkError } = await supabase
      .from('links')
      .select('*')
      .eq('id', linkId)
      .single();

    if (linkError || !link) {
      console.error('Link not found:', linkError);
      return res.status(404).json({ error: 'Link not found' });
    }

    // Get click analytics for this link
    const { data: clicks, error: clicksError } = await supabase
      .from('clicks')
      .select('*')
      .eq('link_id', linkId)
      .order('created_at', { ascending: false });

    if (clicksError) {
      console.error('Error fetching clicks:', clicksError);
      return res.status(500).json({ error: 'Failed to fetch analytics' });
    }

    // Process analytics data
    const analytics = {
      link: {
        id: link.id,
        title: link.title,
        artist: link.artist,
        slug: link.slug
      },
      totalClicks: clicks.length,
      clicksByPlatform: {},
      recentClicks: clicks.slice(0, 10), // Last 10 clicks
      clicksByDate: {}
    };

    // Group clicks by platform
    clicks.forEach(click => {
      analytics.clicksByPlatform[click.platform] = (analytics.clicksByPlatform[click.platform] || 0) + 1;
      
      // Group by date (day)
      const date = new Date(click.created_at).toISOString().split('T')[0];
      analytics.clicksByDate[date] = (analytics.clicksByDate[date] || 0) + 1;
    });

    console.log('Analytics data:', analytics);
    res.json(analytics);

  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Track a click
router.post('/click', async (req, res) => {
  try {
    const { linkId, platform, referrer } = req.body;
    
    console.log('Tracking click:', { linkId, platform, referrer });

    if (!linkId || !platform) {
      return res.status(400).json({ error: 'linkId and platform are required' });
    }

    // Verify the link exists
    const { data: link, error: linkError } = await supabase
      .from('links')
      .select('id')
      .eq('id', linkId)
      .single();

    if (linkError || !link) {
      console.error('Link not found for click tracking:', linkError);
      return res.status(404).json({ error: 'Link not found' });
    }

    // Record the click
    const { data: click, error: clickError } = await supabase
      .from('clicks')
      .insert({
        link_id: linkId,
        platform,
        referrer: referrer || null,
        user_agent: req.headers['user-agent'] || null,
        ip_address: req.ip || req.connection.remoteAddress || null
      })
      .select()
      .single();

    if (clickError) {
      console.error('Error recording click:', clickError);
      return res.status(500).json({ error: 'Failed to record click' });
    }

    console.log('Click recorded successfully:', click);
    res.status(201).json({ message: 'Click tracked successfully', click });

  } catch (error) {
    console.error('Click tracking error:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
