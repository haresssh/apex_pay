import React, { useState, useEffect } from 'react';
import { 
  AppBar, Toolbar, Typography, Button, Container, Grid, Paper, 
  CircularProgress, Box, Dialog, DialogTitle, DialogContent, 
  DialogActions, TextField, Alert, Table, TableBody, TableCell, 
  TableContainer, TableHead, TableRow, Chip 
} from '@mui/material';
import LogoutIcon from '@mui/icons-material/Logout';
import api from '../api';
import './Dashboard.css';

const Dashboard = ({ onLogout }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Transfer Modal State
  const [open, setOpen] = useState(false);
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [message, setMessage] = useState({ type: '', text: '' });
  const [transferring, setTransferring] = useState(false);

  const fetchDashboard = () => {
    api.get('wallet/api/dashboard/') 
      .then(res => { setData(res.data); setLoading(false); })
      .catch(err => { console.error("Fetch error:", err); setLoading(false); });
  };

  useEffect(() => {
    fetchDashboard();
    // Force body background color for this theme
    document.body.style.backgroundColor = '#0a0a0a';
    return () => { document.body.style.backgroundColor = ''; };
  }, []);

  const handleTransfer = async () => { /* ... existing transfer logic ... */
    setMessage({ type: '', text: '' });
    setTransferring(true);
    try {
      await api.post('wallet/api/transfer/', { to_account: recipient, amount: parseFloat(amount) });
      setMessage({ type: 'success', text: 'Transfer successful.' });
      setRecipient(''); setAmount(''); fetchDashboard(); 
      setTimeout(() => setOpen(false), 2000); 
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.error || 'Transfer failed.' });
    } finally { setTransferring(false); }
  };

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}><CircularProgress sx={{ color: '#fff' }} /></Box>;

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#0a0a0a' }}>
      {/* Stark Navbar */}
      <AppBar position="static" elevation={0} sx={{ background: '#0a0a0a', borderBottom: '1px solid #262626' }}>
        <Toolbar>
          <Typography variant="body1" sx={{ flexGrow: 1, fontWeight: 600, letterSpacing: '-0.02em' }}>
            APEX PAY.
          </Typography>
          <Button sx={{ color: '#737373', textTransform: 'none', '&:hover': { color: '#fff' } }} onClick={onLogout} endIcon={<LogoutIcon fontSize="small" />}>
            Sign Out
          </Button>
        </Toolbar>
      </AppBar>

      <Container sx={{ mt: 8, mb: 6 }} maxWidth="lg">
        {/* Header Section */}
        <Typography variant="h3" sx={{ mb: 6, fontWeight: 500, letterSpacing: '-0.03em' }}>
          Overview
        </Typography>

        <Grid container spacing={3} alignItems="stretch">
          
          {/* LEFT COLUMN: Wallet Bento Box */}
          <Grid item xs={12} md={4}>
            <Paper className="hg-card" sx={{ p: 5, height: '100%', display: 'flex', flexDirection: 'column' }}>
              <Typography className="hg-label" sx={{ mb: 2 }}>
                Total Balance
              </Typography>
              
              <Typography className="hg-amount" variant="h2" sx={{ mb: 1 }}>
                ${data ? data.balance : '0.00'}
              </Typography>
              
              <Typography className="hg-label" sx={{ opacity: 0.7, mb: 'auto' }}>
                ACC / {data ? data.account_number : 'N/A'}
              </Typography>
              
              <Button 
                className="hg-btn-primary"
                variant="contained" 
                fullWidth 
                onClick={() => { setOpen(true); setMessage({ type: '', text: '' }); }}
                sx={{ py: 2, mt: 4 }}
              >
                Initiate Transfer
              </Button>
            </Paper>
          </Grid>

          {/* RIGHT COLUMN: Ledger Bento Box */}
          <Grid item xs={12} md={8}>
            <Paper className="hg-card" sx={{ p: 5, height: '100%' }}>
              <Typography className="hg-label" sx={{ mb: 4 }}>
                Ledger
              </Typography>
              
              {data && data.transactions && data.transactions.length > 0 ? (
                <TableContainer>
                  <Table size="medium">
                    <TableHead>
                      <TableRow>
                        <TableCell className="hg-table-header">Timestamp</TableCell>
                        <TableCell className="hg-table-header">Entity</TableCell>
                        <TableCell className="hg-table-header" align="right">Value</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {data.transactions.map((tx) => (
                        <TableRow key={tx.id} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                          <TableCell className="hg-table-cell" sx={{ color: '#737373 !important' }}>
                            {tx.date}
                          </TableCell>
                          
                          <TableCell className="hg-table-cell">
                            <Chip 
                              className="hg-chip"
                              label={tx.type === 'Sent' ? `→ ${tx.counterparty}` : `← ${tx.counterparty}`} 
                              size="small" 
                            />
                          </TableCell>

                          <TableCell align="right" className={tx.type === 'Sent' ? 'hg-table-cell hg-tx-out' : 'hg-table-cell hg-tx-in'}>
                            {tx.type === 'Sent' ? '-' : '+'}${tx.amount}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Box sx={{ mt: 4 }}>
                  <Typography className="hg-label">No ledger entries found.</Typography>
                </Box>
              )}
            </Paper>
          </Grid>

        </Grid>
      </Container>

      {/* The Transfer Modal - Styled Dark */}
      <Dialog 
        open={open} 
        onClose={() => !transferring && setOpen(false)} 
        PaperProps={{ className: 'hg-card', sx: { p: 2, minWidth: { xs: '300px', sm: '400px' } } }}
      >
        <DialogTitle sx={{ fontWeight: 500, letterSpacing: '-0.02em', borderBottom: '1px solid #262626', pb: 2 }}>
          New Transfer
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          {message.text && (
            <Alert severity={message.type} sx={{ mb: 3, bgcolor: '#1a1a1a', color: '#fff', border: '1px solid #333' }}>
              {message.text}
            </Alert>
          )}
          {/* Custom Dark TextFields */}
          <TextField
            label="Recipient Account"
            margin="normal"
            fullWidth variant="outlined" value={recipient}
            onChange={(e) => setRecipient(e.target.value)} disabled={transferring || message.type === 'success'}
            sx={{ mb: 3, mt: 1, input: { color: '#fff' }, label: { color: '#737373' }, '& .MuiOutlinedInput-root': { '& fieldset': { borderColor: '#333' }, '&:hover fieldset': { borderColor: '#555' }, '&.Mui-focused fieldset': { borderColor: '#fff' } } }}
          />
          <TextField
            label="Amount ($)" type="number"
            fullWidth variant="outlined" value={amount}
            onChange={(e) => setAmount(e.target.value)} disabled={transferring || message.type === 'success'}
            sx={{ input: { color: '#fff' }, label: { color: '#737373' }, '& .MuiOutlinedInput-root': { '& fieldset': { borderColor: '#333' }, '&:hover fieldset': { borderColor: '#555' }, '&.Mui-focused fieldset': { borderColor: '#fff' } } }}
          />
        </DialogContent>
        <DialogActions sx={{ pb: 3, pr: 3 }}>
          <Button onClick={() => setOpen(false)} disabled={transferring} sx={{ color: '#737373', '&:hover': { color: '#fff' } }}>
            Cancel
          </Button>
          <Button 
            onClick={handleTransfer} className="hg-btn-primary" disabled={!recipient || !amount || transferring || message.type === 'success'}
            sx={{ px: 3, py: 1 }}
          >
            {transferring ? 'Processing...' : 'Execute'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Dashboard;