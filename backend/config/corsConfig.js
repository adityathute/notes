// config/corsConfig.js

// CORS configuration
const corsOptions = {
    origin: [process.env.ORIGIN],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true // enable set cookie
};

module.exports = corsOptions;
