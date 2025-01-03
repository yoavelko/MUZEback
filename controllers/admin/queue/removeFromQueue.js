const Muze = require('../../../models/muze');

exports.removeFromQueue = async (req, res) => {
    try {
        const track = req.body.track; // The track object to be removed

        // Validate the input
        if (!track || !track.url) {
            return res.status(400).send('Track URL is required');
        }

        // Fetch the Muze document to access `queue`
        const existingMuze = await Muze.findOne({}, { queue: 1 });

        if (!existingMuze) {
            return res.status(404).send('Muze document not found');
        }

        // Check if the track is in the queue
        const trackExistsInQueue = existingMuze.queue.some(t => t.url === track.url);

        if (!trackExistsInQueue) {
            return res.status(404).send('Track not found in queue');
        }

        // Remove the track from the queue
        await Muze.updateOne(
            {}, // Match the first document
            { $pull: { queue: { url: track.url } } }
        );

        return res.status(200).send({
            message: 'Track removed from queue successfully',
            removedTrack: track.url,
        });
    } catch (error) {
        console.error('Error removing track from queue:', error.message);
        return res.status(500).send('Error removing track from queue');
    }
};