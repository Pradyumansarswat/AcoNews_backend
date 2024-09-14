
require('dotenv').config();
const express = require('express');
const axios = require('axios');
const admin = require('firebase-admin');
const cors = require('cors');
const path = require('path');
const fs = require('fs');


const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;


const serviceAccount = JSON.parse(fs.readFileSync(path.resolve(__dirname, serviceAccountPath), 'utf8'));

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: process.env.FIREBASE_DATABASE_URL,
});

const app = express();
app.use(cors());
app.use(express.json());

const port = process.env.PORT || 8000;
const GNEWS_API_KEY = process.env.GNEWS_API_KEY;


app.get('/top-headlines', async (req, res) => {
    const category = req.query.category || 'general';
    const country = req.query.country || 'us';
    const language = req.query.language || 'en';
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 10;

    const url = `https://gnews.io/api/v4/top-headlines?category=${category}&country=${country}&lang=${language}&max=${pageSize}&page=${page}&apikey=${GNEWS_API_KEY}`;

    try {
        const response = await axios.get(url);
        const articles = response.data.articles;

    
        const ref = admin.database().ref('top-headlines');
        await ref.set({ articles });

        res.json({
            page,
            pageSize,
            totalResults: response.data.totalResults,
            articles,
        });
    } catch (error) {
        console.error('Error fetching top headlines:', error);
        res.status(500).send('Error fetching top headlines');
    }
});


app.get('/search-news', async (req, res) => {
    try {
        const { query, country, language, category, page, pageSize } = req.query;

        
        if (!query) {
            return res.status(400).json({ message: 'Query parameter is required' });
        }

        const response = await axios.get('https://gnews.io/api/v4/search', {
            params: {
                q: query,
                country: country || 'us',
                lang: language || 'en',
                category: category || 'general',
                page: page || 1,
                max: pageSize || 10,
                token: GNEWS_API_KEY,
            },
        });

        res.status(200).json(response.data);
    } catch (error) {
        console.error('Error fetching search news:', error.message);
        res.status(500).json({ message: 'Error fetching search news' });
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
