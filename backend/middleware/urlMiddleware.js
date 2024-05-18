// middleware/currentUrlMiddleware.js
const { initializeUserData } = require('../services/utils');

// Middleware to store current and next URL
const storeUrl = (req, res, next) => {
    let currentUrl = `${req.protocol}://${req.get('host')}${req.originalUrl}`;

    // If the current URL starts with '/auth', include it in the stored URL
    if (currentUrl.startsWith(`${req.protocol}://${req.get('host')}/auth`)) {
        currentUrl = `${req.protocol}://${req.get('host')}/auth`;
    }

    // Set current URL cookie
    res.cookie('current_url', currentUrl);
    
    const { data } = initializeUserData(req);

    // If the user is authenticated, set next URL cookie
    if (data && data.isAuthenticated) {
        let nextUrl = req.cookies['current_url'];

        // If the next URL starts with '/auth', exclude it
        if (nextUrl.startsWith(`${req.protocol}://${req.get('host')}/auth`)) {
            nextUrl = `${req.protocol}://${req.get('host')}`;
        }

        res.cookie('next_url', nextUrl);
    }

    next();
};

module.exports = storeUrl;
