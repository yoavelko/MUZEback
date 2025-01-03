const Muze = require('../../../models/muze');

exports.setQueue = async (req, res) => {
    try {
        const tracks = req.body.tracks;

        // Validate input format
        if (!Array.isArray(tracks)) {
            return res.status(400).json({ error: 'Tracks should be an array.' });
        }

        // Validate tracks against the schema
        for (const track of tracks) {
            if (!track.url || !track.name) {
                return res.status(400).json({ error: 'Each track must have at least a "url" and "name".', track });
            }
        }

        // Find the existing Muze document
        const existingMuze = await Muze.findOne({});
        if (!existingMuze) {
            console.log('No Muze document found.');
            return res.status(404).json({ error: 'Muze document not found.' });
        }

        // Force update the queue
        const result = await Muze.updateOne({}, { $set: { queue: tracks } });
        console.log('Update operation result:', result);

        if (result.matchedCount === 0) {
            return res.status(404).json({ error: 'No Muze document matched for update.' });
        }

        return res.status(200).json({
            message: 'Queue replaced successfully',
            updatedQueue: tracks,
        });
    } catch (error) {
        console.error('Error details:', error);
        return res.status(500).json({ error: 'Error setting new queue.', details: error.message });
    }
};
