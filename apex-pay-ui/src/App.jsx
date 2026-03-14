import React, { useState, useEffect } from 'react';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import Dashboard from './components/Dashboard';
import Login from './components/Login';

// Import the new global CSS
import './App.css';

// Minimal MUI Theme to enforce Dark Mode behaviors on components
const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: '#ededed' },
    error: { main: '#ff4d4d' }
  },
  shape: {
    borderRadius: 6, // Sharp edges globally
  },
  typography: {
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, sans-serif',
  },
  components: {
    // Kills MUI's default glowing drop shadows on modals
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none', 
          boxShadow: 'none',
          backgroundColor: '#121212', // Match our CSS variable
        },
      },
    },
  },
});

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (token) setIsAuthenticated(true);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    setIsAuthenticated(false);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      
      {/* Clean wrapper using App.css */}
      <div className="app-container">
        {isAuthenticated ? (
          <Dashboard onLogout={handleLogout} />
        ) : (
          <Login onLogin={() => setIsAuthenticated(true)} />
        )}
      </div>
      
    </ThemeProvider>
  );
}

export default App;