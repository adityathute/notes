import React from 'react';
import './App.css';
import { useAuth, AuthProvider } from './AuthContext';

function App() {
  const { isAuthenticated, login, logout } = useAuth();

  return (
    <div className="App">
      <header className="App-header">
        <h1>Welcome to the Application</h1>
        {isAuthenticated ? (
          <div>
            <button onClick={logout} className="auth-button">Logout</button>
          </div>
        ) : (
          <div>
            <button onClick={login} className="auth-button">Login</button>
          </div>
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
