const axios = require('axios');

exports.getPlaylist = async (req, res) => {
    try {
        // Set the playlist ID based on the condition
        const playlistId = req.body?.isr ? '1M7uvMiWhPlNklT9KdIdH1' : '5iwkYfnHAGMEFLiHFFGnP4';
        const token = req.body?.token;

        // Perform the API request to get playlist details
        const response = await axios.get(`https://api.spotify.com/v1/playlists/${playlistId}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        const playlistData = response.data;

        // Map relevant fields for the playlist tracks
        const tracks = playlistData.tracks.items.map(item => ({
            trackName: item.track.name,
            artist: item.track.artists[0].name,
            album: item.track.album.name,
            release_year: item.track.album.release_date.slice(0, 4),
            spotify_url: item.track.external_urls.spotify,
            preview_url: item.track.preview_url,
            img: item.track.album.images[0]?.url
        }));

        // Send the playlist details and tracks as a response
        res.status(200).json({
            playlistName: playlistData.name,
            description: playlistData.description,
            tracks: tracks
        });

    } catch (error) {
        console.error('Error fetching playlist:', error);
        res.status(500).json({ error: 'Failed to fetch playlist details' });
    }
};
