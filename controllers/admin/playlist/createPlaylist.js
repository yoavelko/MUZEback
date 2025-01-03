const Muze = require('../../../models/muze');

exports.createPlaylist = async (req, res) => {
    try {
        const { name, tracks, url, isSpotifyPl } = req.body;

        // Validate `name` field
        if (!name || typeof name !== 'string') {
            return res.status(400).send({
                message: 'Invalid playlist structure. Must include a name string.',
            });
        }

        // Determine playlist structure based on provided data
        let playlist;

        if (tracks && Array.isArray(tracks)) {
            // Case 1: Full playlist data
            playlist = { name, tracks, isSpotifyPl };
        } else if (url && typeof url === 'string') {
            // Case 2: Spotify playlist data
            playlist = { name, url, isSpotifyPl };
        } else {
            return res.status(400).send({
                message: 'Invalid playlist structure. Must include either a tracks array or a Spotify playlist URL.',
            });
        }

        // Find the document or create it if it doesn't exist
        let muzeDoc = await Muze.findOne({});
        if (!muzeDoc) {
            // Create a new document if none exists
            muzeDoc = new Muze({
                playlists: [playlist], // Initialize playlists with the new playlist
            });
            await muzeDoc.save();
        } else {
            // Push the new playlist to the existing document
            muzeDoc.playlists.push(playlist);
            await muzeDoc.save();
        }

        console.log('Playlist created successfully!');
        return res.status(200).send({
            message: 'Playlist created successfully',
            playlist: playlist,
        });
    } catch (error) {
        console.error('Error creating new playlist:', error);
        return res.status(500).send('Error creating new playlist');
    }
};
