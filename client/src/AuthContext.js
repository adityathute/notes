// src/AuthContext.js
import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const checkAuthStatus = async () => {
    try {
      const response = await axios.get('/auth/status');
      setIsAuthenticated(response.data.isAuthenticated);
      console.log('Auth status response:', response);
    } catch (error) {
      console.error('Error checking auth status:', error);
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
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
        window.location.href = 'http://127.0.0.1:8000/u/signin/identifier';
      }
    } catch (error) {
      return { message: error.response.data.message };
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