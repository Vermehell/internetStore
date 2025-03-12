import React, { useState } from 'react';
import { Dialog, TextField, Button, CircularProgress, DialogTitle, DialogContent, DialogActions, Snackbar, Alert } from '@mui/material';
import api from '../api';
import { useAuth } from '../contexts/AuthContext';

const LoginModal = ({ open, onClose }) => {
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login: authLogin } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await api.post(
        '/users/login',
        `username=${encodeURIComponent(login)}&password=${encodeURIComponent(password)}`,
        {
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          withCredentials: true,
        }
      );

      const userResponse = await api.get('/users/me', { withCredentials: true });
      authLogin(userResponse.data);
      onClose();
    } catch (error) {
      setError('Неверный логин или пароль');
      console.error('Ошибка авторизации:', error.response?.data);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
        <DialogTitle>Вход в систему</DialogTitle>
        <DialogContent>
          <form onSubmit={handleSubmit}>
            <TextField
              label="Логин"
              fullWidth
              value={login}
              onChange={(e) => setLogin(e.target.value)}
              margin="normal"
              required
              disabled={loading}
            />
            <TextField
              label="Пароль"
              type="password"
              fullWidth
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              margin="normal"
              required
              disabled={loading}
            />
            <DialogActions>
              <Button onClick={onClose} color="secondary" disabled={loading}>
                Отмена
              </Button>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                disabled={loading}
              >
                {loading ? <CircularProgress size={24} /> : 'Войти'}
              </Button>
            </DialogActions>
          </form>
        </DialogContent>
      </Dialog>
      <Snackbar
        open={!!error}
        autoHideDuration={4000}
        onClose={() => setError('')}
      >
        <Alert severity="error">{error}</Alert>
      </Snackbar>
    </>
  );
};

export default LoginModal;