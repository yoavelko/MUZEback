const Muze = require('../../../models/muze');  // Import the Muze model

exports.getQueue = async (req, res) => {
    try {
        // Fetch the Muze document and only select the queue field
        const existingMuze = await Muze.findOne({}, { "queue": 1 });

        if (!existingMuze) {
            return res.status(404).send('No Muze document found');
        }

        // Return the queue array
        return res.status(200).json(existingMuze.queue);
    } catch (error) {
        console.error('Error fetching queue:', error.message);
        return res.status(500).send('Error fetching queue');
    }
};