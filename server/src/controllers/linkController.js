const { fetchSpotifyTrack, searchSpotifyTrack } = require('../services/spotifyService');
const { fetchYoutubeTrack, searchYoutubeTrack } = require('../services/youtubeService');
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

// Generate a URL-friendly slug
function generateSlug(title, artist) {
  return `${artist.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
}

// Create a new smart link
async function createLink(req, res) {
  try {
    console.log('createLink - Request body:', req.body);
    console.log('createLink - User:', req.user);
    
    const { url, artist, title } = req.body;
    const userId = req.user.id; // This will be set by auth middleware

    console.log('createLink - Parsed data:', { url, artist, title, userId });

    if (!userId) {
      console.error('createLink - No user ID found');
      return res.status(400).json({ error: 'User not authenticated' });
    }

    // Validate input
    if (!url && (!artist || !title)) {
      console.error('createLink - Invalid input: need either URL or both artist and title');
      return res.status(400).json({ error: 'Either URL or artist and title are required' });
    }

    let trackData;

    // If URL is provided, fetch from the respective platform
    if (url) {
      console.log('createLink - Processing URL:', url);
      if (url.includes('spotify.com')) {
        trackData = await fetchSpotifyTrack(url);
      } else if (url.includes('youtube.com') || url.includes('youtu.be')) {
        trackData = await fetchYoutubeTrack(url);
      } else {
        throw new Error('Unsupported platform URL. Only Spotify and YouTube are supported.');
      }
    } 
    // If no URL but artist and title provided, search on both platforms
    else if (artist && title) {
      console.log('createLink - Processing artist/title:', { artist, title });
      const [spotifyData, youtubeData] = await Promise.allSettled([
        searchSpotifyTrack(artist, title),
        searchYoutubeTrack(artist, title)
      ]);

      trackData = {
        title,
        artist,
        coverArt: spotifyData.value?.coverArt || youtubeData.value?.coverArt,
        isrc: spotifyData.value?.isrc,
        platforms: {
          ...(spotifyData.value?.platforms || {}),
          ...(youtubeData.value?.platforms || {})
        }
      };
    } else {
      throw new Error('Either URL or artist and title are required');
    }

    console.log('createLink - Track data:', trackData);

    // Generate a unique slug
    const slug = generateSlug(trackData.title, trackData.artist);
    console.log('createLink - Generated slug:', slug);

    // Test database connection first
    console.log('createLink - Testing database connection...');
    try {
      const { error: testError } = await supabase.from('links').select('count').limit(1);
      if (testError) {
        console.error('createLink - Database connection test failed:', testError);
        return res.status(500).json({ 
          error: 'Database connection failed. Please run the database setup script.',
          details: testError.message
        });
      }
      console.log('createLink - Database connection successful');
    } catch (error) {
      console.error('createLink - Database test error:', error);
      return res.status(500).json({ 
        error: 'Database connection failed. Please run the database setup script.',
        details: error.message
      });
    }

    // Create the link in the database
    console.log('createLink - Inserting link into database...');
    const { data: link, error: linkError } = await supabase
      .from('links')
      .insert({
        user_id: userId,
        title: trackData.title,
        artist: trackData.artist,
        cover_art: trackData.coverArt,
        slug,
        isrc: trackData.isrc
      })
      .select()
      .single();

    if (linkError) {
      console.error('createLink - Database insert error:', linkError);
      return res.status(500).json({ 
        error: 'Failed to create link in database',
        details: linkError.message
      });
    }

    console.log('createLink - Link created:', link);

    // Create platform links
    const platformLinks = Object.entries(trackData.platforms).map(([platform, url]) => ({
      link_id: link.id,
      platform_name: platform,
      url
    }));

    console.log('createLink - Platform links to create:', platformLinks);

    if (platformLinks.length > 0) {
      const { error: platformError } = await supabase
        .from('platform_links')
        .insert(platformLinks);

      if (platformError) {
        console.error('createLink - Platform links error:', platformError);
        // Don't fail the whole request if platform links fail
        console.log('createLink - Continuing without platform links');
      } else {
        console.log('createLink - Platform links created successfully');
      }
    }

    res.status(201).json({
      ...link,
      platforms: trackData.platforms
    });
  } catch (error) {
    console.error('createLink - Error:', error);
    res.status(400).json({ error: error.message });
  }
}

// Get a link by slug
async function getLinkBySlug(req, res) {
  try {
    const { slug } = req.params;

    // Get the link
    const { data: link, error: linkError } = await supabase
      .from('links')
      .select(`
        *,
        platform_links (
          platform_name,
          url
        )
      `)
      .eq('slug', slug)
      .single();

    if (linkError) throw linkError;
    if (!link) throw new Error('Link not found');

    // Format the response
    const platforms = {};
    link.platform_links.forEach(pl => {
      platforms[pl.platform_name] = pl.url;
    });

    res.json({
      ...link,
      platforms
    });
  } catch (error) {
    console.error('Error fetching link:', error);
    res.status(404).json({ error: error.message });
  }
}

// Get all links for a user
async function getUserLinks(req, res) {
  try {
    const userId = req.user.id;

    const { data: links, error } = await supabase
      .from('links')
      .select(`
        *,
        platform_links (
          platform_name,
          url
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Format the response
    const formattedLinks = links.map(link => {
      const platforms = {};
      link.platform_links.forEach(pl => {
        platforms[pl.platform_name] = pl.url;
      });

      return {
        ...link,
        platforms
      };
    });

    res.json(formattedLinks);
  } catch (error) {
    console.error('Error fetching user links:', error);
    res.status(400).json({ error: error.message });
  }
}

module.exports = {
  createLink,
  getLinkBySlug,
  getUserLinks
};
