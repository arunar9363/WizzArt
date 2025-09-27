const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Vercel's serverless environment doesn't need a specific PORT
// The app.listen() part is removed

app.use(cors());
app.use(express.json());

app.post('/api/generate', async (req, res) => {
  const { prompt, quantity } = req.body;
  const UNSPLASH_ACCESS_KEY = process.env.UNSPLASH_ACCESS_KEY;

  if (!UNSPLASH_ACCESS_KEY) {
    return res.status(500).json({ error: 'API key is not configured on the server.' });
  }

  const API_ENDPOINT = `https://api.unsplash.com/search/photos?query=${prompt}&per_page=${quantity}`;

  try {
    const response = await fetch(API_ENDPOINT, {
      method: 'GET',
      headers: {
        'Authorization': `Client-ID ${UNSPLASH_ACCESS_KEY}`
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch images from Unsplash.');
    }

    const data = await response.json();
    const imageUrls = data.results.map(photo => photo.urls.regular);
    res.json({ images: imageUrls });

  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Export the app for Vercel to use
module.exports = app;