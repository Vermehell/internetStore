import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../api';
import {
  Dialog,
  TextField,
  Button,
  CircularProgress,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Alert
} from '@mui/material';

const RegistrationModal = ({ open, onClose }) => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Регистрация
      const registerResponse = await api.post('/users/register', {
        username,
        email,
        password
      });

      // Автоматический вход после регистрации
      const loginResponse = await api.post(
        '/users/login',
        `username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}`,
        {
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          withCredentials: true,
        }
      );

      // Получение данных пользователя
      const userResponse = await api.get('/users/me', { withCredentials: true });
      login(userResponse.data); // Авторизуем пользователя
      onClose(); // Закрываем модальное окно регистрации
    } catch (error) {
      setError(error.response?.data?.detail || 'Ошибка регистрации');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
        <DialogTitle>Регистрация</DialogTitle>
        <DialogContent>
          <form onSubmit={handleSubmit}>
            <TextField
              label="Имя пользователя"
              fullWidth
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              margin="normal"
              required
            />
            <TextField
              label="Email"
              fullWidth
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              margin="normal"
              required
            />
            <TextField
              label="Пароль"
              fullWidth
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              margin="normal"
              required
            />
            <DialogActions>
              <Button onClick={onClose} color="secondary">
                Отмена
              </Button>
              <Button type="submit" variant="contained" color="primary">
                {loading ? <CircularProgress size={24} /> : 'Зарегистрироваться'}
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

export default RegistrationModal;
