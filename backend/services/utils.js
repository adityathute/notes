// services/utils.js
const jwt = require('jsonwebtoken');
const { TokenExpiredError } = require('jsonwebtoken');
const axios = require('axios');

// Initialization function to get userData 
const initializeUserData = (req) => {
    const userData = req.cookies['user_data'];
    let data = null;
    if (userData) {
        try {
            data = JSON.parse(userData);
        } catch (error) {
            console.error("Error parsing user data:", error);
            data = {};
        }
    }
    return { data };
};

// Verification function to check token validity 
const verifyAccessToken = (req, access) => {
    if (access) {
        const decodedToken = jwt.decode(access, { complete: true });

        // Extract expiration time from the decoded payload
        if (decodedToken && decodedToken.payload.exp) {
            const expTime = decodedToken.payload.exp;
            const currentTimestamp = Math.floor(Date.now() / 1000);
            const remainingTime = expTime - currentTimestamp;
            
            // Log the remaining time
            
            // Check if the token has expired
            if (currentTimestamp < expTime) {
                console.log('Access Token is still valid:', remainingTime, 'seconds');
                return true;
            } else {
                console.log('Access Token has expired.');
                return false;
            }
        } else {
            console.log('Access Token does not contain an expiration time.');
            return false;
        }
    }
    return false;
};

// Verification function to check token validity 
const verifyRefreshToken = (req, refresh) => {
    if (refresh) {
        const decodedToken = jwt.decode(refresh, { complete: true });

        // Extract expiration time from the decoded payload
        if (decodedToken && decodedToken.payload.exp) {
            const expTime = decodedToken.payload.exp;
            const currentTimestamp = Math.floor(Date.now() / 1000);
            const remainingTime = expTime - currentTimestamp;
            
            // Log the remaining time
            
            // Check if the token has expired
            if (currentTimestamp < expTime) {
                console.log('Refresh Token is still valid:', remainingTime, 'seconds');
                return true;
            } else {
                console.log('Refresh Token has expired.');
                return false;
            }
        } else {
            console.log('Refresh Token does not contain an expiration time.');
            return false;
        }
    }
    return false;
};

const refreshToken = async (token) => {
    try {
        const response = await axios.post('http://127.0.0.1:8000/api/token/refresh/', {
            refresh: token
        });

        if (response.status === 200) {
            const { access } = response.data;
            return access;
        } else {
            throw new Error('Failed to refresh token');
        }
    } catch (error) {
        console.error('Error refreshing token:', error);
        throw new Error('Token refresh failed');
    }
};

module.exports = {
    initializeUserData, verifyAccessToken, verifyRefreshToken, refreshToken
};
