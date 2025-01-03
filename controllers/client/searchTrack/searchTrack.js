const axios = require('axios');

exports.searchTrack = async (req, res) => {
    try {
        // const accessToken = await getAccessToken(); // Retrieve the access token dynamically if needed
        const query = encodeURIComponent(req.body?.trackName); // Default for testing
        const token = req.body?.token;

        const response = await axios.get(`https://api.spotify.com/v1/search?q=${query}&type=track&limit=20`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        const tracks = response.data.tracks.items;

        // Map results to show only relevant fields
        const results = tracks.map(track => ({
            trackName: track.name,
            artist: track.artists[0].name,
            album: track.album.name,
            release_year: track.album.release_date.slice(0, 4),
            preview_url: track.preview_url,
            spotify_url: track.external_urls.spotify,
            duration_ms: track.duration_ms,
            img: track.album.images[0]?.url
        }));

        // Send response after mapping
        res.status(200).json({
            query: req.body?.trackName, // Show the song name query
            tracks: results,          // Mapped results
            check: tracks
        });
        
    } catch (error) {
        console.error('Error searching for song:', error);
        res.status(500).json({ error: 'Failed to search for song' });
    }
};
