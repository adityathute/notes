// routes/indexRoutes.js

const express = require('express');
const router = express.Router();

// Test route
router.get('/', (req, res) => {
    res.json({ message: 'API is working!' });
});

module.exports = router;

// // Route handler for the homepage
// router.get('/', (req, res) => {
//     const { data } = initializeUserData(req);
//     if (data && data.isAuthenticated) {
//         res.send(`
//             <h1>Welcome to this site, User.</h1>
//             <form action="/auth/logout" method="post">
//                 <button type="submit">Logout</button>
//             </form>
//             <form action="/about" method="get">
//                 <button type="submit">About</button>
//             </form>
//         `);
//     } else {
//         res.send(`
//             <h1>Welcome to this site.</h1>
//             <form action="/auth/login" method="post">
//                 <button type="submit">Signin</button>
//             </form>
//         `);
//     }
// });

// router.get('/', async (req, res) => {
//     try {
//         // Check if the user is authenticated
//         if (req.isAuthenticated) {
//             const userDataFromCookie = req.cookies['user_data'];
//             const usersData = JSON.parse(userDataFromCookie);
//             const { access_token } = usersData;

//             // Get the CSRF token from the request cookies
//             const csrfToken = req.cookies['csrftoken'];

//             const response = await axios.post(
//                 'http://127.0.0.1:8000/api/get_user_data/',
//                 {}, // Empty request body since it's a POST request
//                 {
//                     headers: {
//                         Authorization: `Bearer ${access_token}`,
//                         'X-CSRFToken': csrfToken // Include CSRF token in the request headers
//                     }
//                 }
//             );

//             const userData = response.data.user_data;
//             res.send(`
//             <h1>Welcome to this site, User ${userData.first_name} ${userData.last_name}.</h1>
//             <form action="/auth/logout" method="post">
//                 <button type="submit">Logout</button>
//             </form>
//             <form action="/about" method="get">
//                 <button type="submit">About</button>
//             </form>
//         `);
//         } else {
//             // If login is required, display a signin button
//             res.send(`
//                 <h1>Welcome to this site.</h1>
//                 <form action="/auth/login" method="post">
//                     <button type="submit">Signin</button>
//                 </form>
//             `);
//         }
//     } catch (error) {
//         console.error('Error fetching user data:', error.response ? error.response.data : error.message);
//         res.status(500).json({ error: 'Failed to fetch user data' });
//     }
// });

// Route handler for the about page
router.get('/about', (req, res) => {
    const { data } = initializeUserData(req);
    if (data && data.isAuthenticated) {
        res.send(`
            <h1>Welcome to this site, About page.</h1>
            <form action="/auth/logout" method="post">
                <button type="submit">Logout</button>
            </form>
            <form action="/about" method="get">
                <button type="submit">About</button>
            </form>
        `);
    } else {
        res.send(`
            <h1>Welcome to this site.</h1>
            <form action="/auth/login" method="post">
                <button type="submit">Signin</button>
            </form>
        `);
    }
});

module.exports = router;