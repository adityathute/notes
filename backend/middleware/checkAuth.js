// middleware/checkAuth.js
const { initializeUserData, verifyAccessToken, verifyRefreshToken, refreshToken } = require('../services/utils');

// Main middleware function to check authentication and verify tokens
const checkAuth = async (req, res, next) => {
    next();
};

// // Main middleware function to check authentication and verify tokens
// const checkAuth = async (req, res, next) => {
//     const { data } = initializeUserData(req);

//     if (data && data.access) {
//         if (verifyAccessToken(req, data.access)) {
//             data.isAuthenticated = true;
//             console.log("Access token is valid.");
//         } else {
//             console.log("Access token is invalid.");
//             if (verifyRefreshToken(req, data.refresh)) {
//                 console.log("Refresh token is valid.");
//                 const refreshResult = await refreshToken(data.refresh);
//                 console.log("refreshResult", refreshResult);
//                 if (refreshResult.success) {
//                     data.isAuthenticated = true;
//                     const refresh = data.refresh;
//                     console.log("Access token is refreshed.");
//                     req.cookies['user_data'] = JSON.stringify({ access: refreshResult.access, refresh });
//                 } else {
//                     data.isAuthenticated = false;
//                     console.error("Failed to refresh access token:", refreshResult.error.message);
//                 }
//             } else {
//                 console.log("Refresh token is invalid.");
//                 data.isAuthenticated = false;
//             }
//         }
//     } else {
//         console.log("User is not authenticated.");
//     }

//     next();
// };

module.exports = checkAuth;
