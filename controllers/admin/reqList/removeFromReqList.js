const Muze = require('../../../models/muze');
const { notifyClients } = require('../../services/socketNotifier');

exports.removeFromReqList = async (req, res, io) => {
    try {
        const tracks = req.body.tracks; // Array of track objects passed in the request body

        if (!Array.isArray(tracks)) {
            return res.status(400).send('Tracks should be an array');
        }

        // Extract the URLs from the given track objects for comparison
        const trackUrls = tracks.map(track => track.url);

        // Remove tracks from reqList where the URL matches any in trackUrls
        const updatedMuze = await Muze.findOneAndUpdate(
            {}, // Match the first document in the Muze collection
            {
                $pull: {
                    reqList: { url: { $in: trackUrls } } // Use $pull to remove matching URLs
                }
            },
            { new: true } // Return the updated document
        );

        if (!updatedMuze) {
            return res.status(404).send('Muze document not found');
        }

        return res.status(200).send(updatedMuze); // Send the updated document back as a response
    } catch (error) {
        console.error('Error removing tracks from reqList:', error.message);
        return res.status(500).send('Error removing tracks from reqList');
    }
};