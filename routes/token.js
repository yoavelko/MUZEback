const express = require('express');
const router = express.Router();
const { getAccessToken } = require('../controllers/services/token');

router.post('/access', getAccessToken);

module.exports = router;