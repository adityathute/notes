// models/user.js

const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    accessToken: String,
    refreshToken: String,
});

module.exports = mongoose.model('User', userSchema);
