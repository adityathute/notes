// Create an object to simulate in-memory storage
const storage = {};
const express = require('express');
const session = require('express-session');
require('dotenv').config();
const app = express();
const PORT = process.env.PORT || 5000;
const APILoginUrl = 'http://127.0.0.1:8000/api/authenticate';
const returnUrl = 'http://localhost:5000';
const appName = 'notes';
const axios = require('axios');
const jwt = require('jsonwebtoken');

// Initialize express-session middleware
app.use(session({
    secret: process.env.SECRET_KEY,
    resave: false,
    saveUninitialized: true
}));

// Middleware function to handle expired tokens
async function handleExpiredToken(req, res, next) {
    const accessToken = storage.accessToken;
    const refreshToken = storage.refreshToken;
    req.arToken = false;

    if (accessToken) {
        // Decode the access token to extract its claims
        const decodedAccessToken = jwt.decode(accessToken, { complete: true });
        const decodedRefreshToken = jwt.decode(refreshToken, { complete: true });

        // Check if the access token has expired
        if (decodedAccessToken && decodedAccessToken.payload.exp * 1000 < Date.now()) {
            // Token has expired, clear it from the session
            console.log('Expired access token removed from session');
            // TODO: Implement logic to refresh access token using refresh token from Django server
            try {
                // Call a function to refresh the access token using the refresh token
                await refreshAccessTokenFromDjango(refreshToken);
                req.arToken = true;
            } catch (error) {
                req.arToken = false;
                console.error('Error refreshing access token:', error);
            }
        } else {
            req.arToken = true;
        }
        
        // Check if the refresh token has expired
        if (decodedRefreshToken && decodedRefreshToken.payload.exp * 1000 < Date.now()) {
            // Token has expired, clear it from the session
            console.log('Expired refresh token removed from session');
            // TODO: Implement logic to refresh access token using refresh token from Django server
            req.arToken = false;
        } else {
            req.arToken = true;
        }
    }
    
    next();
}

async function refreshAccessTokenFromDjango(refreshToken) {
    try {
        // Make a POST request to the Django server's token refresh endpoint
        const response = await axios.post('http://127.0.0.1:8000/api/token/refresh/', {
            refresh: refreshToken
        });
        
        // Extract the new access token from the response data
        const newAccessToken = response.data.access;
        console.log('newAccessToken:', newAccessToken);

        // Optionally, you can return the new access token or handle it further
        return newAccessToken;
    } catch (error) {
        // Handle any errors that occur during the request
        console.error('Error refreshing access token:', error);
        throw error; // Rethrow the error or handle it as needed
    }
}

// Apply middleware globally
app.use(handleExpiredToken);

// Middleware function to check token
const checkToken = (req, res, next) => {
    // Extract the token from the request headers
    const accessToken = storage.accessToken;
    const refreshToken = storage.refreshToken;

    // Check if tokens exists
    if (accessToken && refreshToken) {
        // If access token is already present, continue to the next middleware
        if (req.arToken) {
            req.loginRequired = false;
            next();
        } else {
            req.loginRequired = true;
        }
    } else {
        // If access token is not present, set a flag to indicate login is required
        req.loginRequired = true;
        next();
    }
};

// Apply checkToken middleware to all routes except /login
app.use((req, res, next) => {
    if (req.path !== '/login') {
        req.session.currentUrl = `${req.protocol}://${req.get('host')}${req.originalUrl}`;
    }
    checkToken(req, res, next);
});

// Route handler for the homepage
app.get('/login', (req, res) => {
    if (req.loginRequired) {
        const returnUrl = req.session.currentUrl || '/';

        // Define the login URL with query parameters
        const loginUrl = `${APILoginUrl}?returnUrl=${encodeURIComponent(returnUrl)}&appName=${encodeURIComponent(appName)}`;

        // Generate HTML for the login button with an ID
        const loginButtonHtml = `<a href="${loginUrl}" id="loginButton">Login with Django</a>`;

        // Send the HTML response
        res.send(`Hello from Express.js! ${loginButtonHtml}`);

    } else {
        res.redirect(req.session.currentUrl);
    }
});

// Route handler for the homepage
app.get('/', (req, res) => {
    // If login is required, show the login button
    if (req.loginRequired) {
        res.redirect('/login');
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

    // Process the received tokens as needed
    // You can also send a response back to Django acknowledging the receipt of the tokens
    res.status(200).send('Tokens received by Express.js');
});

// Route handler for the about page
app.get('/about', (req, res) => {
    if (req.loginRequired) {
        res.redirect('/login');
    } else {
        // Otherwise, send the homepage content
        // Sample data
        const data = {
            name: 'Aditya Thute',
            age: 28,
            profession: 'Software Engineer'
        };

        // Send the data as JSON
        res.json(data);
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
