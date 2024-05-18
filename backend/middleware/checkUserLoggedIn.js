// middleware/checkUserLoggedIn.js

const jwt = require('jsonwebtoken');
// const { refreshAccessToken } = require('../services/tokenService');

// // Middleware to check for a logged-in user from cookies
// const isAuthenticated = async (req, res, next) => {
//     const userDataFromCookie = req.cookies['user_data'];

//     if (userDataFromCookie) {
//         const userData = JSON.parse(userDataFromCookie);
//         const { access_token, refresh_token } = userData;

//         if (access_token) {
//             try {
//                 const decodedAccessToken = jwt.decode(access_token, { complete: true });
//                 const remainingAccessTokenExp = (decodedAccessToken.payload.exp * 1000 - Date.now()) / 1000;
//                 if (decodedAccessToken && decodedAccessToken.payload.exp * 1000 < Date.now()) {
//                     console.log('Access token has expired. Remaining time:', remainingAccessTokenExp, 'seconds');
//                     if (refresh_token) {
//                         const decodedRefreshToken = jwt.decode(refresh_token, { complete: true });
//                         const remainingRefreshTokenExp = (decodedRefreshToken.payload.exp * 1000 - Date.now()) / 1000;
//                         if (decodedRefreshToken && decodedRefreshToken.payload.exp * 1000 < Date.now()) {
//                             console.log('Refresh token has expired. Remaining time:', remainingRefreshTokenExp, 'seconds');
//                             req.isAuthenticated = false;
//                             next();
//                         } else {
//                             console.log('Remaining refresh token expiration time:', remainingRefreshTokenExp, 'seconds');
//                             try {
//                                 const newAccessToken = await refreshAccessToken(refresh_token);
//                                 userData.access_token = newAccessToken;
//                                 res.cookie('user_data', JSON.stringify(userData), { httpOnly: true, secure: false, sameSite: 'lax' });
//                                 console.log("Token refreshed successfully");
//                                 req.isAuthenticated = true;
//                                 next();
//                             } catch (refreshError) {
//                                 console.error("Failed to refresh token:", refreshError.message);
//                                 req.isAuthenticated = false;
//                                 next();
//                             }
//                         }
//                     } else {
//                         console.error("Error decoding or verifying refresh token:", error.message);
//                         req.isAuthenticated = false;
//                         next();
//                     }
//                 } else {
//                     console.log('Access token has not expired. Remaining time:', remainingAccessTokenExp, 'seconds');
//                     req.isAuthenticated = true;
//                     next();
//                 }

//             } catch (error) {
//                 console.error("Error decoding or verifying access token:", error.message);
//                 req.isAuthenticated = false;
//                 next();
//             }
//         } else {
//             req.isAuthenticated = false;
//             console.log("No access_token found");
//             next();
//         }
//     } else {
//         req.isAuthenticated = false;
//         console.log("No user found");
//         next();
//     }
// };

module.exports = isAuthenticated;