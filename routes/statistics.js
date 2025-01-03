const express = require('express');
const router = express.Router();

const { getMostPlayed } = require('../controllers/statistics/getMostPlayed');

router.post('/get-most-played', getMostPlayed);

module.exports = router;