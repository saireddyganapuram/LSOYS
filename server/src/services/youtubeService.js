const { google } = require('googleapis');
const youtube = google.youtube('v3');

// Extract video ID from YouTube URL
function getYoutubeVideoId(url) {
  try {
    let videoId;
    // Handle different YouTube URL formats
    if (url.includes('youtu.be/')) {
      videoId = url.split('youtu.be/')[1].split('?')[0];
    } else if (url.includes('youtube.com/watch')) {
      videoId = new URL(url).searchParams.get('v');
    }
    return videoId;
  } catch (error) {
    return null;
  }
}

// Fetch video details from YouTube URL
async function fetchYoutubeTrack(url) {
  try {
    const videoId = getYoutubeVideoId(url);
    if (!videoId) {
      throw new Error('Invalid YouTube URL');
    }

    const response = await youtube.videos.list({
      key: process.env.YOUTUBE_API_KEY,
      part: 'snippet',
      id: videoId
    });

    if (!response.data.items.length) {
      throw new Error('YouTube video not found');
    }

    const video = response.data.items[0];
    const snippet = video.snippet;

    // Try to extract artist and title from video title
    let artist = '';
    let title = snippet.title;

    // Common patterns: "Artist - Title", "Artist — Title", "Artist: Title"
    const patterns = [' - ', ' — ', ': '];
    for (const pattern of patterns) {
      if (snippet.title.includes(pattern)) {
        [artist, title] = snippet.title.split(pattern);
        break;
      }
    }

    return {
      title: title.trim(),
      artist: artist.trim() || snippet.channelTitle,
      coverArt: snippet.thumbnails.maxres?.url || snippet.thumbnails.high?.url,
      platforms: {
        youtube: url
      }
    };
  } catch (error) {
    console.error('Error fetching YouTube video:', error);
    throw error;
  }
}

// Search for a video on YouTube
async function searchYoutubeTrack(artist, title) {
  try {
    const query = `${artist} - ${title} official music video`;
    const response = await youtube.search.list({
      key: process.env.YOUTUBE_API_KEY,
      part: 'snippet',
      q: query,
      type: 'video',
      maxResults: 1
    });

    if (!response.data.items.length) {
      throw new Error('No videos found on YouTube');
    }

    const video = response.data.items[0];
    const videoUrl = `https://youtube.com/watch?v=${video.id.videoId}`;

    return {
      title,
      artist,
      coverArt: video.snippet.thumbnails.high?.url,
      platforms: {
        youtube: videoUrl
      }
    };
  } catch (error) {
    console.error('Error searching YouTube video:', error);
    throw error;
  }
}

module.exports = {
  fetchYoutubeTrack,
  searchYoutubeTrack
};
