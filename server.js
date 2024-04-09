// Create an object to simulate in-memory storage
const storage = {};
const express = require('express');
require('dotenv').config();
const app = express();
const PORT = process.env.PORT || 5000;
const APILoginUrl = 'http://127.0.0.1:8000/api/authenticate';
const returnUrl = 'http://localhost:5000';
const appName = 'notes';
const axios = require('axios');

// Middleware function to check token
const checkToken = (req, res, next) => {
    // Extract the token from the request headers
    const accessToken = storage.accessToken;

    // Check if token exists
    if (accessToken) {
        console.log('Access token exists:', accessToken);
        // If access token is already present, continue to the next middleware
        req.loginRequired = false;
        next();
    } else {
        // If access token is not present, set a flag to indicate login is required
        req.loginRequired = true;
        next();
    }
};

// Apply the middleware to all routes
app.use(checkToken);

// Route handler for the homepage
app.get('/', (req, res) => {
    // If login is required, show the login button
    if (req.loginRequired) {
        const CLIENT_ID = process.env.CLIENT_ID;
        const CLIENT_SECRET = process.env.CLIENT_SECRET;

        // Make a GET request with custom headers
        axios.get(APILoginUrl, {
            headers: {
                'Client-ID': CLIENT_ID,
                'Client-Secret': CLIENT_SECRET,
            }
        })
        .then((response) => {
            // Customize the response based on the server's response
            // For example, you might check the response status or data
            // and modify the HTML accordingly
            // const loginButtonHtml = `<a href="${APILoginUrl}">Login with Django</a>`;
            const loginButtonHtml = `<a href="${APILoginUrl}?returnUrl=${encodeURIComponent(returnUrl)}&appName=${encodeURIComponent(appName)}">Login with Django</a>`;
            res.send(`Hello from Express.js! ${loginButtonHtml}`);
        })
        .catch((error) => {
            console.error(error);
            res.status(500).send('Error occurred while processing your request.');
        });
    } else {
        // Otherwise, send the homepage content
        res.send(`Homepage`);
    }
});


// Route handler for receiving token from Django
app.post('/receive_data', (req, res) => {
    // Extract the access token from the Authorization header
    const accessToken = req.headers.authorization.split(' ')[1];

    // Extract the refresh token from the custom X-Refresh-Token header
    const refreshToken = req.headers['x-refresh-token'];

    storage.accessToken = accessToken;
    storage.refreshToken = refreshToken;

    // Log the received tokens for debugging
    console.log('Received access token from Django:', accessToken);
    console.log('Received refresh token from Django:', refreshToken);

    // Process the received tokens as needed
    // You can also send a response back to Django acknowledging the receipt of the tokens
    res.status(200).send('Tokens received by Express.js');
});

// Route handler for the about page
app.get('/about', (req, res) => {
    // Sample data
    const data = {
        name: 'Aditya Thute',
        age: 28,
        profession: 'Software Engineer'
    };

    // Send the data as JSON
    res.json(data);
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
