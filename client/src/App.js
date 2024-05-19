// App.js
import React, { useState, useEffect } from 'react';
import './App.css';
import { useAuth, AuthProvider } from './AuthContext';

function App() {
  const { isAuthenticated, login, logout } = useAuth();
  const [isLoading, setIsLoading] = useState(true);

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
              <button onClick={logout} className="auth-button">Logout</button> {/* Logout directly */}
            </div>
          ) : (
            <div>
              <h1>Welcome to the Application</h1>
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
