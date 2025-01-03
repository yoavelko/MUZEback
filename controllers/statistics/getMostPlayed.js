const Muze = require('../../models/muze');

exports.getMostPlayed = async (req, res) => {
    try {
        const { timeFrame } = req.body;

        if (!timeFrame) {
            return res.status(400).json({ error: 'Time frame is required' });
        }

        const muzeDoc = await Muze.findOne();

        if (!muzeDoc) {
            return res.status(404).json({ error: 'Muze document not found' });
        }

        const { history } = muzeDoc;

        if (!history || history.size === 0) {
            return res.status(404).json({ error: 'History is empty' });
        }

        const countPlays = (tracks, playCountMap) => {
            if (!Array.isArray(tracks)) return;
            tracks.forEach(track => {
                const { name, artist } = track; // Extract name and artist
                if (name && artist) {
                    const key = `${name}-${artist}`; // Use name and artist as the unique key
                    if (!playCountMap[key]) {
                        playCountMap[key] = { count: 0, lastTrack: track.toObject() };
                        console.log('first found:', track);
                    }
                    playCountMap[key].count += 1;
                    console.log(`${playCountMap[key].count} times found:`, track);
        
                    playCountMap[key].lastTrack = { ...track.toObject() }; // Update the latest played track
                }
            });
        };

        const playCountMap = {};
        const now = new Date();

        switch (timeFrame) {
            case 'day': {
                const today = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')}`;
                const year = history.get(now.getFullYear().toString());
                if (year) {
                    const month = year.months.get((now.getMonth() + 1).toString().padStart(2, "0"));
                    if (month) {
                        const day = month.days.get(today.split('-')[2]);
                        if (day) countPlays(day.tracks, playCountMap);
                        else console.warn(`Day data for ${today} is undefined.`);
                    } else {
                        console.warn('Month data is undefined.');
                    }
                } else {
                    console.warn('Year data is undefined.');
                }
                break;
            }
            case 'week': {
                // Generate last 7 days from the current date backward
                const last7Days = Array.from({ length: 7 }, (_, i) => {
                    const date = new Date(now);
                    date.setDate(now.getDate() - i);
                    const midDate = date.toISOString().split('T')[0];
                    const finalDate = midDate.split('-')[2];
                    return finalDate;
                });

                const year = history.get(now.getFullYear().toString());
                if (year) {
                    year.months.forEach((month, monthKey) => {
                        month.days.forEach((day, dayKey) => {
                            if (last7Days.includes(dayKey)) {
                                countPlays(day.tracks, playCountMap); // Ensure each track is counted
                            }
                        });
                    });
                }
                break;
            }
            case 'month': {
                const last30Days = Array.from({ length: 30 }, (_, i) => {
                    const date = new Date(now);
                    date.setDate(now.getDate() - i);
                    const midDate = date.toISOString().split('T')[0];
                    const finalDate = midDate.split('-')[2];
                    return finalDate;
                });

                const currentYear = now.getFullYear().toString();
                const year = history.get(currentYear);
                if (year) {
                    year.months.forEach((month, monthKey) => {
                        month.days.forEach((day, dayKey) => {
                            if (last30Days.includes(dayKey)) countPlays(day.tracks, playCountMap);
                        });
                    });
                }
                break;
            }
            case 'overall': {
                history.forEach(year => {
                    year.months.forEach(month => {
                        month.days.forEach(day => countPlays(day.tracks, playCountMap));
                    });
                });
                break;
            }
            default:
                return res.status(400).json({ error: 'Invalid time frame' });
        }

        const mostPlayedTracks = Object.values(playCountMap)
            .filter(entry => entry.count > 0)
            .sort((a, b) => b.count - a.count) // Sort by count descending
            .map(entry => ({
                ...entry.lastTrack,
                timesPlayed: entry.count,
            }));

        return res.status(200).json(mostPlayedTracks);
    } catch (error) {
        console.error('Error fetching most played tracks:', error.message);
        return res.status(500).json({ error: 'Internal server error' });
    }
};
