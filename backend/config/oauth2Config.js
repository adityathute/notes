// config/oauth2Config.js

const passport = require('passport');
const OAuth2Strategy = require('passport-oauth2').Strategy;

passport.use(new OAuth2Strategy({
    authorizationURL: `${process.env.AUTHURL}/oauth/authorize`,
    tokenURL: `${process.env.AUTHURL}/oauth/token`,
    clientID: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    callbackURL: `${process.env.ORIGIN}/auth/callback`
  },
  function(access, refresh, profile, cb) {
    // Callback function to handle user profile
    // You can save the tokens and user profile to the database or session
    return cb(null, profile);
  }
));

module.exports = passport;