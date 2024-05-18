const express = require('express');
const axios = require('axios');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
require('dotenv').config();

const app = express();
const PORT = 5000;
const djangoURL = 'http://127.0.0.1:8000';

// Middleware
app.use(cookieParser());
app.use(isAuthenticated); // Apply isAuthenticated middleware to all routes

// Authentication Middleware
const isAuthenticated = async (req, res, next) => {
    try {
        // Extract access token from cookie
        const accessToken = req.cookies.accessToken;

        if (!accessToken) {
            throw new Error('Access token not found');
        }

        // Verify access token
        const decodedToken = jwt.verify(accessToken, process.env.JWT_SECRET);
        
        // Attach user data to request object
        req.user = decodedToken.user;

        next();
    } catch (error) {
        console.error('Authentication Error:', error);
        res.status(401).json({ message: 'Unauthorized' });
    }
};

// Root Route
app.get('/', (req, res) => {
    res.send('Welcome to the Express server!');
});

// Route to retrieve data from Django
app.get('/data', async (req, res) => { // No need to explicitly add isAuthenticated here
    try {
        // Forward request to Django to fetch data 
        const djangoResponse = await axios.get(`${djangoURL}/authenticate`, {
            headers: {
                Authorization: `Bearer ${req.cookies.accessToken}`
            }
        });

        res.json(djangoResponse.data);
    } catch (error) {
        console.error('Error fetching data:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
