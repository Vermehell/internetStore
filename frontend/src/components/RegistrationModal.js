import React, { useState } from 'react';
import { Dialog, TextField, Button, CircularProgress, DialogTitle, DialogContent, DialogActions, Snackbar, Alert } from '@mui/material';
import api from '../api';
import { useAuth } from '../contexts/AuthContext';

const RegistrationModal = ({ open, onClose }) => {
    const [login, setLogin] = useState('');
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const { login: authLogin } = useAuth();

    const validateFields = () => {
        if (login.length < 3 || login.length > 50) {
            setError('Логин должен быть от 3 до 50 символов');
            return false;
        }
        if (username.length < 3 || username.length > 50) {
            setError('Имя пользователя должно быть от 3 до 50 символов');
            return false;
        }
        if (password.length < 6) {
            setError('Пароль должен быть не менее 6 символов');
            return false;
        }
        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!validateFields()) {
            return; // Остановить отправку, если есть ошибки
        }

        setLoading(true);
        try {
            const response = await api.post('/users/register', {
                login,
                username,
                email,
                password,
            });

            // Автоматический вход после регистрации
            const loginResponse = await api.post(
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
            const serverError = error.response?.data?.detail || 'Ошибка регистрации';
            setError(serverError);
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
                            label="Логин"
                            fullWidth
                            value={login}
                            onChange={(e) => setLogin(e.target.value)}
                            margin="normal"
                            required
                            error={!!error && error.includes('Логин')}
                        />
                        <TextField
                            label="Имя"
                            fullWidth
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            margin="normal"
                            required
                            error={!!error && error.includes('Имя')}
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
                            error={!!error && error.includes('Пароль')}
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