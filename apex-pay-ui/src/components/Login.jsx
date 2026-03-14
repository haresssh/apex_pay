import React, { useState, useEffect } from 'react';
import { Box, TextField, Button, Typography, Paper, Container, Alert } from '@mui/material';
import api from '../api';
import './Dashboard.css'; // Reusing our global minimalist styles

const Login = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  // Ensure the body is pitch black for the login screen
  useEffect(() => {
    document.body.style.backgroundColor = '#0a0a0a';
    return () => { document.body.style.backgroundColor = ''; };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const response = await api.post('api/token/', {
        username,
        password,
      });

      localStorage.setItem('access_token', response.data.access);
      localStorage.setItem('refresh_token', response.data.refresh);
      onLogin();
    } catch (err) {
      setError('Invalid credentials. Access denied.');
    }
  };

  // Reusable strict styling for the inputs
  const inputStyle = {
    input: { color: '#fff' }, 
    label: { color: '#a3a3a3' }, 
    '& label.Mui-focused': { color: '#ededed' }, 
    '& .MuiOutlinedInput-root': { 
      borderRadius: '6px', 
      '& fieldset': { borderColor: '#333' }, 
      '&:hover fieldset': { borderColor: '#555' }, 
      '&.Mui-focused fieldset': { borderColor: '#ededed' } 
    }
  };

  return (
    <Container maxWidth="xs" sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', minHeight: '100vh' }}>
      
      <Box sx={{ width: '100%', mb: 5, textAlign: 'center' }}>
        <Typography variant="h3" sx={{ fontWeight: 600, letterSpacing: '-0.04em', color: '#ededed' }}>
          APEX PAY.
        </Typography>
        <Typography className="hg-label" sx={{ mt: 1, color: '#737373' }}>
          System Authentication
        </Typography>
      </Box>

      <Paper className="hg-card" sx={{ p: 5, width: '100%' }}>
        
        {error && (
          <Alert severity="error" sx={{ mb: 3, bgcolor: '#1a1a1a', color: '#fff', border: '1px solid #333' }}>
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <TextField
            label="Identifier"
            fullWidth
            variant="outlined"
            margin="normal"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            sx={inputStyle}
          />
          <TextField
            label="Passphrase"
            type="password"
            fullWidth
            variant="outlined"
            margin="normal"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            sx={{ ...inputStyle, mt: 2 }}
          />
          <Button
            type="submit"
            fullWidth
            className="hg-btn-primary"
            sx={{ 
              mt: 4, 
              py: 1.5, 
              fontSize: '0.85rem', 
              letterSpacing: '0.05em',
              textTransform: 'uppercase'
            }}
          >
            Authenticate
          </Button>
        </form>
      </Paper>
    </Container>
  );
};

export default Login;