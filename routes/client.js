const express = require('express');
const router = express.Router();
const { searchTrack } = require('../controllers/client/searchTrack/searchTrack');
const { getPlaylist } = require('../controllers/client/getPlaylist/getPlaylist');
const { sendTrack } = require('../controllers/client/sendTrack/sendTrack');

router.post('/search-track', searchTrack);
router.post('/get-playlist', getPlaylist);
router.post('/send-track', (req, res) => {
    sendTrack(req, res, req.app.locals.io);  // Pass io to the controller
});

module.exports = router;