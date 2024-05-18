const axios = require('axios');

const refreshAccessToken = async (refreshToken) => {
    try {
        const response = await axios.post('http://127.0.0.1:8000/api/token/refresh/', {
            refresh: refreshToken
        });

        if (response.status === 200) {
            const { access } = response.data;
            return access;
        } else {
            throw new Error('Failed to refresh token');
        }
    } catch (error) {
        console.error('Error refreshing token:', error);
        throw new Error('Token refresh failed');
    }
};

module.exports = {
    refreshAccessToken,
};
