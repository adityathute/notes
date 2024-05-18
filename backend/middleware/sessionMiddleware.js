// middleware/sessionMiddleware.js

const sessionMiddleware = (session, store) => {
    return (req, res, next) => {
        console.log(req.session)
        // Check if session exists
        if (!req.session) {
            // If session doesn't exist, create a new session
            return session({
                secret: process.env.SECRET_KEY,
                resave: false,
                saveUninitialized: true,
                store: store,
                cookie: {
                    secure: false, // Set to true if served over HTTPS
                    sameSite: 'none', // Allow cross-origin requests
                    httpOnly: true,
                    maxAge: 1000 * 60 * 60 * 24 * 30
                }
            })(req, res, next);
        } else {
            // If session exists, continue to the next middleware
            next();
        }
    };
};

const corsMiddleware = (req, res, next) => {
    const allowedOrigin = 'http://127.0.0.1';
    const allowedPort = '8000';

    res.header('Access-Control-Allow-Origin', `${allowedOrigin}:${allowedPort}`);
    res.header('Access-Control-Allow-Credentials', true);
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
};

module.exports = { sessionMiddleware, corsMiddleware };
