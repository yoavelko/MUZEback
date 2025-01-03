const Muze = require('../../../models/muze');
const { notifyClients } = require('../../services/socketNotifier');

exports.addToQueue = async (req, res, io) => {
    try {
        const tracks = req.body.tracks; // The array of tracks passed in the request body

        // Validate the input
        if (!Array.isArray(tracks)) {
            return res.status(400).send(`Tracks should be an array, ${tracks}`);
        } else {
            console.log(tracks);
            
        }

        // Fetch the Muze document to access `queue` and `reqList`
        const existingMuze = await Muze.findOne({}, { queue: 1, reqList: 1 });

        if (!existingMuze) {
            return res.status(404).send('Muze document not found');
        }

        const existingQueueUrls = new Set(existingMuze.queue.map(track => track.url));
        const existingReqListUrls = new Set(existingMuze.reqList.map(track => track.url));

        // Tracks to be added to the queue
        const tracksToAddToQueue = [];
        const tracksToRemoveFromReqList = [];

        for (const track of tracks) {
            if (existingReqListUrls.has(track.url)) {
                // 2. If the track exists in reqList, remove it from reqList and add it to queue
                tracksToRemoveFromReqList.push(track.url);
                if (!existingQueueUrls.has(track.url)) {
                    tracksToAddToQueue.push(track);
                    existingQueueUrls.add(track.url); // Ensure it won't be added again
                }
            } else if (!existingQueueUrls.has(track.url)) {
                // 4. If the track doesn't exist in queue, add it to queue
                tracksToAddToQueue.push(track);
                existingQueueUrls.add(track.url); // Ensure it won't be added again
            }
        }

        // Perform updates
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
                    { $push: { queue: { $each: tracksToAddToQueue, $position: 1 } } }
                )
            );
        }

        // Execute all updates
        await Promise.all(updateOperations);

        return res.status(200).send({
            message: 'Tracks processed successfully',
            addedToQueue: tracksToAddToQueue.map(track => track.url),
            removedFromReqList: tracksToRemoveFromReqList,
        });
    } catch (error) {
        console.error('Error adding tracks to queue:', error.message);
        return res.status(500).send('Error adding tracks to queue');
    }
};