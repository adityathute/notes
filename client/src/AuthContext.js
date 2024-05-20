// src/AuthContext.js
import React, { createContext, useState, useContext, useEffect, useRef } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loginAttempted, setLoginAttempted] = useState(localStorage.getItem('loginAttempted') === 'true' || false);

  const loginAttemptedRef = useRef(loginAttempted);

  useEffect(() => {
    if (loginAttemptedRef.current) {
      login();
    }
  }, []);

  const checkAuthStatus = async () => {
    try {
      const response = await axios.get('/auth/status');
      console.log('Auth response:', response);
      if (response.data.auth) {
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
      setIsAuthenticated(false);
    }
  };

  useEffect(() => {
    checkAuthStatus();
  }, [isAuthenticated]); // Watch changes in isAuthenticated state

  const login = async () => {
    try {
      const response = await axios.post('/auth/login');
      console.log('Login response:', response);

      // Check if the authentication was successful
      if (response.data.success) {
        if (response.data.auth) {
          setLoginAttempted(false); // Reset loginAttempted on successful login
          localStorage.setItem('loginAttempted', 'false');
          setIsAuthenticated(response.data.auth);
        } else {
          // Set loginAttempted to true to indicate that the user attempted to log in
          setLoginAttempted(true);
          localStorage.setItem('loginAttempted', 'true');
          setIsAuthenticated(false);
          const app_url = encodeURIComponent('http://127.0.0.1:3000');
          const appName = encodeURIComponent('notes');
          window.location.href = `http://127.0.0.1:8000/api/login?app_url=${app_url}&appName=${appName}`;
          // Execution stops here due to redirection
        }
      } else {
        console.error('Authentication failed:', response.data.message);
        setIsAuthenticated(false);
        return { message: response.data.message };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { message: error.response?.data?.message || 'An unknown error occurred' };
    }
  };

  const logout = async () => {
    try {
      const response = await axios.post('/auth/logout');
      console.log('Logout response:', response);
      if (response.data.success) {
        setIsAuthenticated(false);
      }
      return response.data;
    } catch (error) {
      return { message: error.response.data.message };
    }
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
