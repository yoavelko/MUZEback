const Muze = require('../../../models/muze');  // Import the Muze model

exports.getSpecificHistory = async (req, res) => {
    try {
        // Extract year, month, and day from request body
        const { year, month, day } = req.body;

        // Fetch the Muze document
        const existingMuze = await Muze.findOne({}, { "history": 1 });

        if (!existingMuze) {
            return res.status(404).send('No Muze document found');
        }

        // Access the specific year, month, and day
        const yearData = existingMuze.history.get(year);
        if (!yearData) {
            return res.status(404).send(`Year not found, ${year}`);
        }

        const monthData = yearData.months.get(month);
        if (!monthData) {
            return res.status(404).send('Month not found');
        }

        const dayData = monthData.days.get(day);
        if (!dayData) {
            return res.status(404).send('Day not found');
        }

        // Return the tracks for the specific day
        return res.status(200).json(dayData.tracks);
    } catch (error) {
        console.error('Error fetching day data:', error.message);
        return res.status(500).send('Error fetching day data');
    }
};
