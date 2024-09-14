require('dotenv').config();

module.exports = {
    port: process.env.PORT || 8000,
    gnewsApiKey: process.env.GNEWS_API_KEY,
    firebaseDatabaseUrl: process.env.FIREBASE_DATABASE_URL
};
