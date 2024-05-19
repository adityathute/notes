// routes/authRoutes.js
const axios = require('axios');
const express = require('express');
const router = express.Router();
const { initializeUserData } = require('../services/utils');
const jwt = require('jsonwebtoken');

router.get('/status', (req, res) => {
  // Check authentication status here (e.g., check if user is logged in)
  const { data } = initializeUserData(req);
  if (data && data.isAuthenticated) {
    res.status(200).json({ isAuthenticated: true });
  } else {
    res.status(200).json({ isAuthenticated: false });
  }
});

router.get('/user', (req, res) => {
  // Check authentication status here (e.g., check if user is logged in)
  const { data } = initializeUserData(req);
  if (data && data.isAuthenticated) {
    res.status(200).json({ data });
  }
});

router.post('/login', async (req, res) => {
  try {
    const response = await axios.post(
      `${process.env.AUTHURL}/api/authenticate`,
      {},
      {
        headers: {
          'Client-ID': process.env.CLIENT_ID,
          'Client-Secret': process.env.CLIENT_SECRET,
          'Content-Type': 'application/json',
          'Cookie': req.headers.cookie
        },
        withCredentials: true
      }
    );

    // Check if the response status is 200
    if (response.data.auth === 'isAuthenticated') {
      const { access } = response.data;
      const decodedToken = jwt.decode(access);
      const isAuthenticated = true;
      const user_id = decodedToken.user_id;
      const userData = { access, isAuthenticated, user_id };

      // Set user data in cookie
      const expirationDate = new Date();
      expirationDate.setDate(expirationDate.getDate() + 1); // Expires in 1 day
      res.cookie('user_data', JSON.stringify(userData), { httpOnly: true, secure: true, sameSite: 'Strict', expires: expirationDate });
      // Send success response  
      res.json({ success: true, message: 'authenticated' });
    } else if (response.data.auth === 'unAuthenticated') {
      res.json({ success: false, message: 'unAuthenticated' });
    } else {
      // Send failure response if authentication fails
      res.json({ success: false, message: 'Authentication failed' });
    }
  } catch (error) {
    console.error('Login failed:', error);
    res.status(500).json({ success: false, message: 'Login failed' });
  }
});

router.post('/logout', (req, res) => {
  res.clearCookie('user_data');
  res.json({ success: true });
});

module.exports = router;














// const express = require('express');
// const router = express.Router();
// const axios = require('axios');
// const jwt = require('jsonwebtoken');
// const { verifyAccessToken, verifyRefreshToken, refreshToken } = require('../services/utils');

// // Function to handle user authentication and cookie setting
// const authenticateUser = async (req, res) => {
//   let isAuthenticated = false; // Initialize isAuthenticated
//   let next_url = req.cookies['next_url'];

//   const response = await axios.post(
//     'http://127.0.0.1:8000/api/get_token',
//     {},
//     {
//       headers: {
//         'Content-Type': 'application/json',
//         'Cookie': req.headers.cookie
//       },
//       withCredentials: true
//     }
//   );

//   // Check if the response status is 'error'
//   if (response.data.status === 'loginIsRequired') {
//     // Handle the error response
//     return res.status(500).json({ message: 'Error: Tokens not found' });
//   }

// if (response.status === 200) {
//     const { access, refresh } = response.data;

//     if (access && refresh) {
//         if (verifyAccessToken(req, access)) {
//             isAuthenticated = true;
//             console.log("Access token is valid.");
//         } else {
//             console.log("Access token is invalid.");
//             if (verifyRefreshToken(req, refresh)) {
//                 console.log("Refresh token is valid.");
//                 const refreshResult = await refreshToken(refresh);
//                 console.log("refreshResult", refreshResult);
//                 if (refreshResult.success) {
//                     isAuthenticated = true;
//                     console.log("Access token is refreshed.");
//                     req.cookies['user_data'] = JSON.stringify({ access: refreshResult.access, refresh });
//                 } else {
//                     data.isAuthenticated = false;
//                     console.error("Failed to refresh access token:", refreshResult.error.message);
//                 }
//             } else {
//                 console.log("Refresh token is invalid.");
//                 isAuthenticated = false;
//             }
//         }
//     }

//     console.log('access', access);
//     const decodedToken = jwt.decode(access);
//     console.log('decodedToken', decodedToken);
//     const user_id = decodedToken.user_id;


//     // Set cookies for access token and refresh token
//     // Combine access token, refresh token, and user ID into a single object
//     const userData = { access, refresh, user_id, isAuthenticated };

//     // Set a single cookie containing the JSON data
//     res.cookie('user_data', JSON.stringify(userData), { httpOnly: true, secure: false, sameSite: 'lax' });
// }
// };

// // Handle login POST request
// router.post('/login', async (req, res) => {
//     const response = await axios.post(
//         'http://127.0.0.1:8000/api/get_token',
//         {},
//         {
//             headers: {
//                 'Content-Type': 'application/json',
//                 'Cookie': req.headers.cookie
//             },
//             withCredentials: true
//         }
//     );

//     // Check if the response status is 'error'
//     if (response.status === 'loginIsRequired') {
//         // Handle the error response
//         return res.status(500).json({ message: 'Error: Tokens not found' });
//     }

//     // try {
//     //     // Call the function to authenticate user and set cookie
//     //     await authenticateUser(req, res);

//     //     // Redirect the user to the homepage after successful login
//     //     res.redirect('/');
//     // } catch (error) {
//     //     // Handle login failure
//     //     console.error(error);
//     //     res.status(500).json({ error: 'Login failed' });
//     // }
// });

// const CLIENT_ID = 'your_client_id';
// const CLIENT_SECRET = 'your_client_secret';
// const REDIRECT_URI = 'http://localhost:3000/callback';
// const AUTH_SERVER_URL = 'http://django-server.com/oauth/authorize';

// router.get('/login', (req, res) => {
//   // Redirect the user to the authorization server for login
//   const params = qs.stringify({
//     response_type: 'code',
//     client_id: CLIENT_ID,
//     redirect_uri: REDIRECT_URI,
//   });
//   res.redirect(`${AUTH_SERVER_URL}?${params}`);
// });

// // Handle logout POST request
// router.post('/logout', (req, res) => {
//     res.clearCookie('user_data'); // Clear the user ID cookie
//     res.redirect('/');
// });

// module.exports = router;
