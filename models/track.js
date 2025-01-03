const mongoose = require('mongoose');

const trackSchema = new mongoose.Schema({
    url: { type: String, required: true },
    name: { type: String },
    img: { type: String },
    uploaded: { type: String },
    artist: { type: String },
    album: { type: String },
    length: { type: Number },
    timePlayed: {
        type: String, validate: {
            validator: v => /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(v),
            message: 'Time Played must be in HH:MM format'
        }
    },
    timeRequested: {
        type: String, validate: {
            validator: v => /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(v),
            message: 'Time Played must be in HH:MM format'
        }
    },
    date: { type: String },
    numOfVotes: [{ type: String }],
    numOfSuggests: [{ type: String }],
    rank: { type: Number },
    numPlayed: { type: Number },
    genre: { type: String }
})

module.exports = trackSchema;