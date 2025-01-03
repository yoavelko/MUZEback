const axios = require('axios');
require('dotenv').config();
const clientId = process.env.CLIENT_ID;
const clientSecret = process.env.CLIENT_SECRET;


exports.getAccessToken = async (req, res) => {
  const tokenUrl = 'https://accounts.spotify.com/api/token';
  const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

  try {
    const response = await axios.post(tokenUrl, 'grant_type=client_credentials', {
      headers: {
        'Authorization': `Basic ${credentials}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });

    res.status(201).json({
        token: response.data.access_token
    });
    
  } catch (error) {
    console.error('Failed to get access token:', error);
  }
};
