const axios = require('axios');
const Muze = require('../../../models/muze');
require('dotenv').config();
const clientId = process.env.CLIENT_ID;
const clientSecret = process.env.CLIENT_SECRET;

exports.playlistToQueue = async (req, res) => {

    const tokenUrl = 'https://accounts.spotify.com/api/token';
    const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
    
    try {
        let token;
        let tracks = [];

        if (req.body.spotifyPlaylistId) {

            //Get spotify access token
            try {
                const response = await axios.post(tokenUrl, 'grant_type=client_credentials', {
                    headers: {
                        'Authorization': `Basic ${credentials}`,
                        'Content-Type': 'application/x-www-form-urlencoded'
                    }
                });

                token = response.data.access_token

            } catch (error) {
                console.error('Failed to get access token:', error);
            }

            // Handle Spotify playlist
            const playlistId = req.body.spotifyPlaylistId;

            const muzeDocument = await Muze.findOne(
                { playlists: { $elemMatch: { _id: playlistId } } },
                { playlists: 1 }
            );

            if (!muzeDocument) {
                return res.status(404).send('Muze document not found');
            }

            const playlist = muzeDocument.playlists.find(p => p._id.toString() === playlistId);

            if (!playlist) {
                return res.status(404).send('Playlist not found');
            }

            const spotifyId = playlist.url;

            const response = await axios.get(`https://api.spotify.com/v1/playlists/${spotifyId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            const playlistData = response.data;

            tracks = playlistData.tracks.items.map(item => ({
                name: item.track.name,
                artist: item.track.artists[0].name,
                album: item.track.album.name,
                uploaded: item.track.album.release_date.slice(0, 4),
                spotify_url: item.track.external_urls.spotify,
                preview_url: item.track.preview_url,
                img: item.track.album.images[0]?.url,
                url: item.track.external_urls.spotify, // Assuming `url` is needed for matching
            }));
        } else if (req.body.mongoPlaylistId) {
            // Handle MongoDB playlist
            const mongoPlaylistId = req.body.mongoPlaylistId;

            const muzeDocument = await Muze.findOne(
                { playlists: { $elemMatch: { _id: mongoPlaylistId } } },
                { playlists: 1 }
            );

            if (!muzeDocument) {
                return res.status(404).send('Muze document not found');
            }

            const playlist = muzeDocument.playlists.find(p => p._id.toString() === mongoPlaylistId);

            if (!playlist) {
                return res.status(404).send('Playlist not found');
            }

            tracks = playlist.tracks;
        } else {
            return res.status(400).send('Invalid request. Provide either spotifyPlaylistId or mongoPlaylistId.');
        }

        // Fetch the Muze document for queue and reqList
        const muzeDocument = await Muze.findOne({}, { queue: 1, reqList: 1 });

        if (!muzeDocument) {
            return res.status(404).send('Muze document not found');
        }

        const existingQueueUrls = new Set(muzeDocument.queue.map(track => track.url));
        const existingReqListUrls = new Set(muzeDocument.reqList.map(track => track.url));

        // Tracks to be added to the queue
        const tracksToAddToQueue = [];
        const tracksToRemoveFromReqList = [];

        for (const track of tracks) {
            if (existingReqListUrls.has(track.url)) {
                tracksToRemoveFromReqList.push(track.url);
                if (!existingQueueUrls.has(track.url)) {
                    tracksToAddToQueue.push(track);
                    existingQueueUrls.add(track.url); // Ensure it won't be added again
                }
            } else if (!existingQueueUrls.has(track.url)) {
                tracksToAddToQueue.push(track);
                existingQueueUrls.add(track.url); // Ensure it won't be added again
            }
        }

        const updateOperations = [];

        if (tracksToRemoveFromReqList.length > 0) {
            updateOperations.push(
                Muze.updateOne(
                    {}, // Match the first document
                    { $pull: { reqList: { url: { $in: tracksToRemoveFromReqList } } } }
                )
            );
        }

        if (tracksToAddToQueue.length > 0) {
            updateOperations.push(
                Muze.updateOne(
                    {}, // Match the first document
                    { $push: { queue: { $each: tracksToAddToQueue } } }
                )
            );
        }

        await Promise.all(updateOperations);

        return res.status(200).send({
            message: 'Tracks processed successfully',
            addedToQueue: tracksToAddToQueue.map(track => track.url),
            removedFromReqList: tracksToRemoveFromReqList,
        });
    } catch (error) {
        console.error('Error processing playlist:', error);
        return res.status(500).json({ error: 'Failed to process playlist' });
    }
};
