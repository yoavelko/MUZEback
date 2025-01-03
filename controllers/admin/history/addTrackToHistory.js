const Muze = require('../../../models/muze');
const axios = require('axios');

exports.addTrackToHistory = async (req, res) => {
    try {
        const track = req.body;

        // Validate the track object
        if (!track || typeof track !== 'object') {
            return res.status(400).send({
                message: 'Track must be a valid object',
            });
        }

        // Get the current date and time
        const currentDate = new Date();
        const year = currentDate.getFullYear().toString();
        const month = (currentDate.getMonth() + 1).toString().padStart(2, '0');
        const date = currentDate.getDate().toString().padStart(2, '0');
        const timePlayed = `${currentDate.getHours().toString().padStart(2, '0')}:${currentDate.getMinutes().toString().padStart(2, '0')}`;

        // Add the current time to the track object
        track.timePlayed = timePlayed;

        // Log the track object for inspection
        console.log(JSON.stringify(track, null, 2)); // Pretty print the track object

        // const response = await axios.get('https://musicbrainz.org/ws/2/recording/', {
        //     params: {
        //         query: `recording:"${track.name}" AND artist:"${track.artist}"`,
        //         fmt: 'json'
        //     },
        //     headers: {
        //         'User-Agent': 'MUZE/1.0 (yoavelkobi889@gmail.com)'
        //     }
        // });

        // let trackGenre = response.data?.recordings?.[0]?.tags?.[0]?.name;
        const trackGenre = 'undefined'

        // for (let i = 0; i < response.data?.recordings.length; i++) {
        //     if (response.data?.recordings[i].tags) {
        //         trackGenre = response.data?.recordings?.[i]?.tags?.[0]?.name;
        //         return;
        //     }
        // }
        if (trackGenre) {
            track.genre = trackGenre;
        } else {
            track.genre = 'undefined';
        }

        // Step 1: Ensure the nested structure exists
        await Muze.findOneAndUpdate(
            {},
            {
                $setOnInsert: {
                    [`history.${year}`]: {
                        months: {
                            [month]: {
                                days: {
                                    [date]: {
                                        tracks: [],
                                    },
                                },
                            },
                        },
                    },
                },
            },
            {
                upsert: true, // Create the document if it doesn't exist
                new: true,
            }
        );

        // Step 2: Push the track to the specified day
        const updateResult = await Muze.updateOne(
            {},
            {
                $push: {
                    [`history.${year}.months.${month}.days.${date}.tracks`]: track,
                },
            }
        );

        console.log('Track added to history successfully:', track);
        
        return res.status(200).send({
            message: 'Track added to history successfully',
            dateKey: `${year}.${month}.${date}`,
            track,
        });
    } catch (error) {
        console.error('Error adding track to history:', error);
        return res.status(500).send('Error adding track to history');
    }
};