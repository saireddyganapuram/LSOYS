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
    const { url, artist, title } = req.body;
    const userId = req.user.id; // This will be set by auth middleware

    let trackData;

    // If URL is provided, fetch from the respective platform
    if (url) {
      if (url.includes('spotify.com')) {
        trackData = await fetchSpotifyTrack(url);
      } else if (url.includes('youtube.com') || url.includes('youtu.be')) {
        trackData = await fetchYoutubeTrack(url);
      } else {
        throw new Error('Unsupported platform URL');
      }
    } 
    // If no URL but artist and title provided, search on both platforms
    else if (artist && title) {
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

    // Generate a unique slug
    const slug = generateSlug(trackData.title, trackData.artist);

    // Create the link in the database
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

    if (linkError) throw linkError;

    // Create platform links
    const platformLinks = Object.entries(trackData.platforms).map(([platform, url]) => ({
      link_id: link.id,
      platform_name: platform,
      url
    }));

    const { error: platformError } = await supabase
      .from('platform_links')
      .insert(platformLinks);

    if (platformError) throw platformError;

    res.status(201).json({
      ...link,
      platforms: trackData.platforms
    });
  } catch (error) {
    console.error('Error creating link:', error);
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
