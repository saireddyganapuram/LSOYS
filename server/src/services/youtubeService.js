// Simplified YouTube service for testing (without API keys)
// In production, you would need to set GOOGLE_API_KEY

// Extract YouTube video ID from URL
function getYoutubeVideoId(url) {
  try {
    const urlObj = new URL(url);
    if (urlObj.hostname.includes('youtube.com')) {
      return urlObj.searchParams.get('v');
    } else if (urlObj.hostname.includes('youtu.be')) {
      return urlObj.pathname.slice(1);
    }
    return null;
  } catch (error) {
    return null;
  }
}

// Fetch track details from YouTube URL (simplified for testing)
async function fetchYoutubeTrack(url) {
  try {
    const videoId = getYoutubeVideoId(url);
    if (!videoId) {
      throw new Error('Invalid YouTube URL');
    }

    // For testing, create mock data
    // In production, this would call the YouTube API and return real thumbnail
    // For now, return null to indicate no cover art available
    return {
      title: 'Sample YouTube Track',
      artist: 'Sample YouTube Artist',
      coverArt: null, // No cover art available in test mode
      isrc: 'USRC87654321',
      platforms: {
        youtube: url
      }
    };
  } catch (error) {
    console.error('Error fetching YouTube track:', error);
    throw error;
  }
}

// Search for a track on YouTube (simplified for testing)
async function searchYoutubeTrack(artist, title) {
  try {
    // For testing, return mock data
    // In production, this would search the YouTube API and return real thumbnail
    // For now, return null to indicate no cover art available
    return {
      title: title || 'Sample YouTube Track',
      artist: artist || 'Sample YouTube Artist',
      coverArt: null, // No cover art available in test mode
      isrc: 'USRC87654321',
      platforms: {
        youtube: `https://www.youtube.com/results?search_query=${encodeURIComponent(artist + ' ' + title)}`
      }
    };
  } catch (error) {
    console.error('Error searching YouTube track:', error);
    throw error;
  }
}

module.exports = {
  fetchYoutubeTrack,
  searchYoutubeTrack
};
