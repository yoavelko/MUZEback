const Muze = require('../../../models/muze');

exports.sendTrack = async (req, res, io) => {
    try {
        const now = new Date();
        const currentTime = now.toTimeString().slice(0, 5);  // Format time as HH:MM
        const currentDate = now.toISOString().split('T')[0]; // Format date as YYYY-MM-DD

        // Ensure the body contains all the necessary data
        let { url, name, artist, album, length, timePlayed, timeRequested, date, numOfVotes, numOfSuggests, rank, numPlayed, img, uploaded } = req.body;

        if (!name || !artist || !album || !url) {
            return res.status(400).send('Missing required track information');
        }

        const toSlice = "https://open.spotify.com/track/";
        const toPatch = "spotify:track:";
        if (url.startsWith(toSlice)) {
            url = url.slice(toSlice.length);
            url = `${toPatch}${url}`;
        }



        // Try to find the track in the reqList by URL
        try {
            const updatedMuze = await Muze.findOneAndUpdate(
                { 'reqList.url': url }, // Find a document where reqList contains a track with the same URL
                {
                    $set: {
                        'reqList.$.timeRequested': currentTime,
                        'reqList.$.date': currentDate,
                        'reqList.$.numOfVotes': numOfVotes,
                        'reqList.$.numOfSuggests': numOfSuggests,
                        'reqList.$.rank': rank,
                        'reqList.$.numPlayed': numPlayed,
                        'reqList.$.img': img,
                        'reqList.$.uploaded': uploaded,
                    },
                    $inc: { 'reqList.$.rank': 1 } // Increment the rank if track already exists
                },
                { new: true, upsert: true } // Create the document if none exists
            );
        } catch {
            await Muze.findOneAndUpdate(
                {}, // Match the first document in the Muze collection
                {
                    $push: {
                        reqList: {
                            url,
                            name,
                            artist,
                            album,
                            length,
                            timePlayed,
                            timeRequested: currentTime,
                            date: currentDate,
                            numOfVotes,
                            numOfSuggests,
                            rank: 0,
                            numPlayed,
                            img,
                            uploaded
                        }
                    }
                },
                { new: true, upsert: true } // Create the document if none exists
            );
        }

        return res.status(200).send(req.body);  // Send the updated document back as a response
    } catch (error) {
        console.error('Error adding track to reqList:', error.message);
        return res.status(500).send('Error adding track to reqList');
    }
};