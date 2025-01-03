const express = require('express');
const router = express.Router();
const { getReqList } = require('../controllers/admin/reqList/getReqList');
const { addToQueue } = require('../controllers/admin/queue/addToQueue');
const { getQueue } = require('../controllers/admin/queue/getQueue');
const { removeFromReqList } = require('../controllers/admin/reqList/removeFromReqList');
const { removeFromQueue } = require('../controllers/admin/queue/removeFromQueue');
const { playlistToQueue } = require('../controllers/admin/playlist/playlistToQueue');
const { createPlaylist } = require('../controllers/admin/playlist/createPlaylist');
const { addTrackToHistory } = require('../controllers/admin/history/addTrackToHistory');
const { getSpecificHistory } = require('../controllers/admin/history/getSpecificHistory');
const { setQueue } = require('../controllers/admin/queue/setQueue');
const { setReqList } = require('../controllers/admin/reqList/setReqList');
const { getPlaylists } = require('../controllers/admin/playlist/getPlaylists');

router.get('/get-req', getReqList);
router.get('/get-queue', getQueue)
router.post('/add-to-queue', (req, res) => {
    addToQueue(req, res, req.app.locals.io)
});
router.post('/remove-req-list', (req, res) => {
    removeFromReqList(req, res, req.app.locals.io)
});
router.post('/remove-from-queue', (req, res) => {
    removeFromQueue(req, res, req.app.locals.io)
});
router.post('/playlist-to-queue', playlistToQueue);
router.post('/create-playlist', createPlaylist);
router.get('/get-playlists', getPlaylists);
router.post('/add-to-history', addTrackToHistory);
router.post('/get-specific-history', getSpecificHistory);
router.post('/set-queue', setQueue);
router.post('/set-req-list', setReqList);

module.exports = router;