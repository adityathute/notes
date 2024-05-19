// App.js
import React, { useState, useEffect } from 'react';
import './App.css';
import { useAuth, AuthProvider } from './AuthContext';
import axios from 'axios';

function App() {
  const { isAuthenticated, login, logout } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const setLoadingStatus = async () => {
      try {
        setIsLoading(true);
        await new Promise(resolve => setTimeout(resolve, 500));
        setIsLoading(false);
      } catch (error) {
        console.error('Error checking auth status:', error);
      }
    };
  
    setLoadingStatus();
  }, []);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await axios.get('/auth/user');
        console.log('User data response:', response); // Add this line to check the response data
        if (response.data.data) {
          setUserData(response.data.data);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };
  
    if (isAuthenticated) {
      fetchUserData();
    }
  }, [isAuthenticated]);
  

  return (
    <div className="App">
      <header className="App-header">
        {isLoading ? ( // Show loading animation if isLoading is true
          <div className="loading">
            <div className="spinner"></div>
            <h4>Loading...</h4> {/* Changed loading text */}
          </div>
        ) : (
          isAuthenticated ? (
            <div>
              <h1>Welcome Back</h1>
              <h5>User is Authenticated</h5>
              {userData && <p>User ID: {userData.user_id}</p>} {/* Show user ID if userData exists */}
              <button onClick={logout} className="auth-button">Logout</button> {/* Logout directly */}
            </div>
          ) : (
            <div>
              <h1>Welcome to the Application</h1>
              <h5>User is not Authenticated</h5>
              <button onClick={login} className="auth-button">Login</button> {/* Login directly */}
            </div>
          )
        )}
      </header>
    </div>
  );
}

const AppWrapper = () => (
  <AuthProvider>
    <App />
  </AuthProvider>
);

export default AppWrapper;
