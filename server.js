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

// Initialize express-session middleware
app.use(session({
    secret: process.env.SECRET_KEY,
    resave: false,
    saveUninitialized: true
  }));

// Middleware function to check token
const checkToken = (req, res, next) => {

    // Extract the token from the request headers
    const accessToken = storage.accessToken;
    const refreshToken = storage.accessToken;

    // Check if token exists
    if (accessToken) {
        console.log('Access token exists:', accessToken);
        
        if (refreshToken) {
            console.log('Refresh token exists:', refreshToken);
        }

        // If access token is already present, continue to the next middleware
        req.loginRequired = false;
        next();
    } else {
        // If access token is not present, set a flag to indicate login is required
        req.loginRequired = true;
        if (refreshToken) {
            console.log('Refresh token exists in else part where not accessToken:', refreshToken);
            
        } else {
            req.loginRequired = true;
        }
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
