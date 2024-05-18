// Create an object to simulate in-memory storage
const storage = {};
const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);
require('dotenv').config();
const app = express();
const PORT = process.env.PORT || 5000;
const APILoginUrl = 'http://127.0.0.1:8000/api/authenticate';
const returnUrl = 'http://localhost:5000';
const appName = 'notes';
const axios = require('axios');
const jwt = require('jsonwebtoken');

// Connect to MongoDB database
mongoose.connect('mongodb://localhost:27017/database_name', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('Connected to MongoDB');
})
.catch((error) => {
  console.error('Error connecting to MongoDB:', error);
});

// Initialize MongoDBStore for session storage
const store = new MongoDBStore({
    uri: 'mongodb://localhost:27017/database_name',
    collection: 'sessions',
  });
  
  // Catch errors in MongoDBStore
  store.on('error', (error) => {
    console.error('MongoDBStore Error:', error);
  });

// Define MongoDB schema and model for user
const userSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    accessToken: String,
    refreshToken: String,
});

const User = mongoose.model('User', userSchema);

// Create session middleware
const sessionMiddleware = session({
    secret: process.env.SECRET_KEY,
    resave: true,
    saveUninitialized: false,
    store: store,
});

app.use(sessionMiddleware);

// Middleware function to handle expired tokens
async function handleExpiredToken(req, res, next) {
    const userId = storage.userId;
    if (userId) {
        const userData = await User.findOne({ user_id: userId });
        const accessToken = userData.accessToken;
        const refreshToken = userData.refreshToken;
    
        const SessionrefreshToken1 = req.session.refreshToken;
        console.log('userId:', userId);
        console.log('Session Refresh token:', SessionrefreshToken1);
    
        req.arToken = false;
    
        if (accessToken && refreshToken) {
            // Decode the access token to extract its claims
            const decodedAccessToken = jwt.decode(accessToken, { complete: true });
            const decodedRefreshToken = jwt.decode(refreshToken, { complete: true });
    
            // Check if the access token has expired
            if (decodedAccessToken && decodedAccessToken.payload.exp * 1000 < Date.now()) {
                // Token has expired, calculate remaining expiration time in seconds
                const remainingAccessTokenExp = (decodedAccessToken.payload.exp * 1000 - Date.now()) / 1000;
                console.log('Access token has expired. Remaining time:', remainingAccessTokenExp, 'seconds');
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
                // Calculate remaining expiration time in seconds
                const remainingAccessTokenExp = (decodedAccessToken.payload.exp * 1000 - Date.now()) / 1000;
                console.log('Remaining access token expiration time:', remainingAccessTokenExp, 'seconds');
                req.arToken = true;
            }
            
            // Check if the refresh token has expired
            if (decodedRefreshToken && decodedRefreshToken.payload.exp * 1000 < Date.now()) {
                // Token has expired, calculate remaining expiration time in seconds
                const remainingRefreshTokenExp = (decodedRefreshToken.payload.exp * 1000 - Date.now()) / 1000;
                console.log('Refresh token has expired. Remaining time:', remainingRefreshTokenExp, 'seconds');
                // TODO: Implement logic to refresh access token using refresh token from Django server
                req.arToken = false;
            } else {
                // Calculate remaining expiration time in seconds
                const remainingRefreshTokenExp = (decodedRefreshToken.payload.exp * 1000 - Date.now()) / 1000;
                console.log('Remaining refresh token expiration time:', remainingRefreshTokenExp, 'seconds');
                req.arToken = true;
            }
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
        storage.accessToken = newAccessToken;
        
        // Decode the access token to extract user ID
        const decodedAccessToken = jwt.decode(newAccessToken);
        const userId = decodedAccessToken.user_id; // Adjust this according to your token structure
        storage.userId = userId;

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
    const userId = storage.userId;
    
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

// Logout route
app.post('/logout', (req, res) => {
    console.log("Logout requested...");
    // Destroy the session
    req.session.destroy(err => {
        if (err) {
            console.error('Error destroying session:', err);
            return res.status(500).send('Internal Server Error');
        }
        // Delete the accessToken property from the storage object
        delete storage.accessToken;
        delete storage.refreshToken;
        console.log("Session destroyed successfully.");
        // Redirect to login page or any other page after logout
        res.redirect('/');
    });
});

// Route handler for the homepage
app.get('/', (req, res) => {
    // If login is required, redirect to the login page
    if (req.loginRequired) {
        console.log("Redirecting to login page...");
        res.redirect('/login');
    } else {
        // If the user is logged in, display the home page with logout and about buttons
        res.send(`
            <h1>Welcome to this site.</h1>
            <form action="/logout" method="post">
                <button type="submit">Logout</button>
            </form>
            <form action="/about" method="get">
                <button type="submit">About</button>
            </form>
        `);
    }
});

// Route handler for receiving token from Django
app.post('/receive_data', async (req, res) => {
    // Extract the access token from the Authorization header
    const accessToken = req.headers.authorization.split(' ')[1];

    // Extract the refresh token from the custom X-Refresh-Token header
    const refreshToken = req.headers['x-refresh-token'];

    // Decode the access token to extract user ID
    const decodedAccessToken = jwt.decode(accessToken);
    const userId = decodedAccessToken.user_id; // Adjust this according to your token structure
    req.session.user_id = userId;

    try {
        // Find user by user ID
        let user = await User.findOneAndUpdate(
            { userId: userId }, // Search criteria
            { accessToken: accessToken, refreshToken: refreshToken }, // New data to update
            { upsert: true, new: true } // Options: create if not exists, return new document
        );

        console.log('User details saved to database');
    } catch (error) {
        console.error('Error saving user details to database:', error);
        res.status(500).send('Error saving user details to database');
        return; // Exit function early if error occurs
    }

    // Store data into the session
    storage.accessToken = accessToken;
    storage.accessToken = accessToken;
    storage.userId = userId;

    res.status(200).send('Tokens received by Express.js');
}); 


// Route handler for the about page
app.get('/about', (req, res) => {
    if (req.loginRequired) {
        res.redirect('/login');
    } else {
        // Send the homepage content with a back button
        res.send(`
            <h1>About Page</h1>
            <p>Name: Aditya Thute</p>
            <p>Age: 28</p>
            <p>Profession: Software Engineer</p>
            <a href="/">Back to Home</a>
        `);
    }
});


// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
