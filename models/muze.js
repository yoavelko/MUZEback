const mongoose = require('mongoose');
const trackSchema = require('./track');
const playlistSchema = require('./playlist');

const daySchema = new mongoose.Schema({
    tracks: [
        new mongoose.Schema({
            url: String,
            name: String,
            img: String,
            uploaded: String,
            artist: String,
            timePlayed: String,
            genre: String,
            album: String,
        }),
    ],
});

const monthSchema = new mongoose.Schema({
    days: {
        type: Map,
        of: daySchema,
    },
});

const yearSchema = new mongoose.Schema({
    months: {
        type: Map,
        of: monthSchema,
    },
});

// Define muzeSchema
const muzeSchema = new mongoose.Schema({
    history: {
        type: Map,
        of: yearSchema,
    },
    reqList: [trackSchema],
    queue: [trackSchema],
    playlists: [playlistSchema],
});

// Create the Muze model
const Muze = mongoose.model('Muze', muzeSchema, 'muze'); // Use 'muze' collection name

module.exports = Muze;
