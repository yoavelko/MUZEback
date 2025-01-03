const Muze = require('../../../models/muze');

exports.getPlaylists = async (req, res) => {
    try {
        // Find the Muze document and project only the playlists field
        const muzeDocument = await Muze.findOne({}, { playlists: 1 });

        if (!muzeDocument || !muzeDocument.playlists) {
            return res.status(404).send('No playlists found');
        }

        // Extract playlists array
        const playlists = muzeDocument.playlists.map(playlist => ({
            mongoPlaylistId: playlist._id,
            name: playlist.name,
            trackCount: playlist.tracks.length, // Optional: Number of tracks in the playlist
            tracks: playlist.tracks, // Full tracks array if needed
            isSpotifyPl: playlist.isSpotifyPl
        }));

        res.status(200).json(playlists);
    } catch (error) {
        console.error('Error fetching playlists:', error);
        res.status(500).send('Failed to fetch playlists');
    }
};