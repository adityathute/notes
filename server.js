// server.js

// Load environment variables from .env file
require('dotenv').config();

// Import necessary modules
const express = require('express');
const path = require('path');
const cors = require('cors');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const helmet = require('helmet');
const compression = require('compression');
const corsOptions = require('./backend/config/corsConfig');
const connectDB = require('./backend/config/dbConfig');
const passport = require('./backend/config/oauth2Config');
const checkAuth = require('./backend/middleware/checkAuth');
const authRoutes = require('./backend/routes/authRoutes');

// Connect to MongoDB database
connectDB();

// Create Express application
const app = express();

// Apply middleware
app.use(cors(corsOptions));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser(process.env.SECRET_KEY));
app.use(passport.initialize());
app.use(morgan('dev'));
app.use(helmet());
app.use(compression());
app.use(checkAuth);

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err.message);
    res.status(500).send('Internal server error');
});

// Apply routes
app.use('/auth', authRoutes);

// Serve the React app for any other routes
app.use(express.static(path.join(__dirname, 'client/build')));

// Handle routing for SPA (Single Page Application)
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
});

// Start the server
app.listen(process.env.PORT, () => {
    console.log(`Server is running on port ${process.env.PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
    console.error(`Unhandled Rejection: ${err.message}`);
    // Optionally log the stack trace
    console.error(err.stack);
});