const mongoose = require('mongoose');
const trackSchema = require('./track')

const playlistSchema = new mongoose.Schema({
    name: { type: String, required: true },
    tracks: [trackSchema],
    url: { type: String },
    isSpotifyPl: { type: Boolean }
})

module.exports = playlistSchema;