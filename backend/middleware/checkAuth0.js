// middleware/checkAuth.js
const jwt = require('jsonwebtoken');
const axios = require('axios');

// Function to check if the user is authenticated
const checkAuthentication = (userData) => {
    if (userData) {
        const { isAuthenticated } = JSON.parse(userData);
        return isAuthenticated;
    }
    return false;
};

// Function to verify access token
const verifyAccessToken = (accessToken, secretKey) => {
    try {
        const decoded = jwt.verify(accessToken, secretKey);
        return { valid: true, decoded };
    } catch (error) {
        return { valid: false, error };
    }
};

// Function to verify refresh token
const verifyRefreshToken = (refreshToken, secretKey) => {
    try {
        const decoded = jwt.verify(refreshToken, secretKey);
        return { valid: true, decoded };
    } catch (error) {
        return { valid: false, error };
    }
};

// Function to refresh access token
const refreshAccessToken = async (refreshToken) => {
    try {
        const response = await axios.post('http://127.0.0.1:8000/api/token/refresh/', {
            refresh: refreshToken
        });
        if (response.status === 200) {
            const { access } = response.data;
            return { success: true, access };
        } else {
            throw new Error('Failed to refresh token');
        }
    } catch (error) {
        return { success: false, error };
    }
};

// Main middleware function to check authentication and verify tokens
const checkAuth = async (req, res, next) => {
    const userData = req.cookies['user_data'];

    if (checkAuthentication(userData)) {
        req.isAuthenticated = true;
        console.log("User is authenticated.");
    } else {
        req.isAuthenticated = false;
        console.log("User is not authenticated.");
    }

    if (userData) {
        const { access_token, refresh_token } = JSON.parse(userData);
        const accessTokenResult = verifyAccessToken(access_token, process.env.SECRET_KEY);
        if (accessTokenResult.valid) {
            req.isAuthenticated = true;
            console.log("Access token is valid.");
        } else {
            console.log("Access token is invalid.");

            const refreshTokenResult = verifyRefreshToken(refresh_token, process.env.SECRET_KEY);
            if (refreshTokenResult.valid) {
                console.log("Refresh token is valid.");
                const refreshResult = await refreshAccessToken(refresh_token);
                if (refreshResult.success) {
                    req.isAuthenticated = true;
                    console.log("Access token is refreshed.");
                    req.cookies['user_data'] = JSON.stringify({ access_token: refreshResult.access, refresh_token });
                } else {
                    console.error("Failed to refresh access token:", refreshResult.error.message);
                }
            } else {
                console.log("Refresh token is invalid or expired.");
            }
        }
    }

    next();
};

module.exports = checkAuth;
