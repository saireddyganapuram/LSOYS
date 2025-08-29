const SpotifyWebApi = require('spotify-web-api-node');

const spotifyApi = new SpotifyWebApi({
  clientId: process.env.SPOTIFY_CLIENT_ID,
  clientSecret: process.env.SPOTIFY_CLIENT_SECRET
});

// Function to refresh access token
async function refreshSpotifyToken() {
  try {
    const data = await spotifyApi.clientCredentialsGrant();
    spotifyApi.setAccessToken(data.body['access_token']);
    // Token expires in 1 hour, refresh it after 50 minutes
    setTimeout(refreshSpotifyToken, 50 * 60 * 1000);
  } catch (error) {
    console.error('Error refreshing Spotify token:', error);
  }
}

// Extract Spotify track ID from URL
function getSpotifyTrackId(url) {
  try {
    const trackId = url.split('track/')[1].split('?')[0];
    return trackId;
  } catch (error) {
    return null;
  }
}

// Fetch track details from Spotify URL
async function fetchSpotifyTrack(url) {
  try {
    const trackId = getSpotifyTrackId(url);
    if (!trackId) {
      throw new Error('Invalid Spotify URL');
    }

    const data = await spotifyApi.getTrack(trackId);
    const track = data.body;

    return {
      title: track.name,
      artist: track.artists.map(artist => artist.name).join(', '),
      coverArt: track.album.images[0]?.url,
      isrc: track.external_ids.isrc,
      platforms: {
        spotify: url
      }
    };
  } catch (error) {
    console.error('Error fetching Spotify track:', error);
    throw error;
  }
}

// Search for a track on Spotify
async function searchSpotifyTrack(artist, title) {
  try {
    const query = `track:${title} artist:${artist}`;
    const data = await spotifyApi.searchTracks(query);
    
    if (!data.body.tracks.items.length) {
      throw new Error('No tracks found on Spotify');
    }

    const track = data.body.tracks.items[0];
    return {
      title: track.name,
      artist: track.artists.map(artist => artist.name).join(', '),
      coverArt: track.album.images[0]?.url,
      isrc: track.external_ids.isrc,
      platforms: {
        spotify: track.external_urls.spotify
      }
    };
  } catch (error) {
    console.error('Error searching Spotify track:', error);
    throw error;
  }
}

// Initialize token refresh
refreshSpotifyToken();

module.exports = {
  fetchSpotifyTrack,
  searchSpotifyTrack
};
