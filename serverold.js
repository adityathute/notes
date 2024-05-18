// server.js

const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);
const config = require('./config/config');
const sessionMiddleware = require('./middleware/sessionMiddleware');
const currentUrlMiddleware = require('./middleware/currentUrlMiddleware');
const isAuthenticated = require('./middleware/checkUserLoggedIn');
const authRoutes = require('./routes/authRoutes');
const indexRoutes = require('./routes/indexRoutes');
require('dotenv').config();
const cors = require('cors');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');

// Connect to MongoDB database
mongoose.connect(config.MONGODB_URI, {
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
    uri: config.MONGODB_URI,
    collection: 'sessions',
});

// Catch errors in MongoDBStore
store.on('error', (error) => {
    console.error('MongoDBStore Error:', error);
});

const app = express();

// Set trust proxy
app.set('trust proxy', 1);

app.use(cors({
    origin: [process.env.ORIGIN],//frontend server localhost:8080
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true // enable set cookie
}));

app.use(cookieParser(process.env.CLIENT_SECRET)); // any string ex: 'keyboard cat'
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

// Apply session middleware
app.use(sessionMiddleware.sessionMiddleware(session, store));

// Apply CORS middleware
app.use(sessionMiddleware.corsMiddleware);

// Apply token middleware
app.use(isAuthenticated);

// // Apply middleware to store current URL
// app.use(currentUrlMiddleware);

// Apply routes
app.use('/auth', authRoutes);
app.use('/', indexRoutes);

// Start the server
app.listen(config.PORT, () => {
    console.log(`Server is running on port ${config.PORT}`);
});
