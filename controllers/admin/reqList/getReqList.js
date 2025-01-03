const Muze = require('../../../models/muze');  // Path to your Muze model

exports.getReqList = async (req, res) => {
    try {
        // Retrieve the first document in the Muze collection
        const muze = await Muze.findOne({});

        if (!muze) {
            return res.status(404).json({ message: 'Muze data not found' });
        }

        // Extract the reqList from the retrieved document
        const reqList = muze.reqList;

        // Return the reqList as the response
        return res.status(200).json(reqList);
    } catch (error) {
        console.error('Error retrieving reqList:', error.message);
        return res.status(500).json({ message: 'Server error' });
    }
};