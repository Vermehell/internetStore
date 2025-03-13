import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Container, Typography, Button, TextField, Snackbar, Alert } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import api from '../api';

const ProfilePage = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [newUsername, setNewUsername] = useState('');
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const handleUpdateUsername = async () => {
        try {
            const response = await api.put(`/users/${user.id}/username`, {
                new_username: newUsername,
            });
            setSnackbarMessage('Имя успешно обновлено');
            setSnackbarOpen(true);
            // Обновляем данные пользователя в контексте
            logout(); // Выйти и обновить данные
            navigate('/login'); // Перенаправить на страницу входа
        } catch (error) {
            setSnackbarMessage('Ошибка при обновлении имени');
            setSnackbarOpen(true);
            console.error('Ошибка:', error.response?.data);
        }
    };

    return (
        <Container maxWidth="lg" style={{ padding: 20 }}>
            <Typography variant="h4" gutterBottom>
                Профиль пользователя
            </Typography>
            {user ? (
                <div>
                    <Typography variant="h6">Логин: {user.login}</Typography>
                    <Typography variant="h6">Имя: {user.username}</Typography>
                    <Typography variant="h6">Email: {user.email}</Typography>
                    <Typography variant="h6" style={{ marginBottom: 20 }}>
                        Статус: {user.is_admin ? 'Администратор' : 'Пользователь'}
                    </Typography>

                    {/* Форма для изменения имени */}
                    <TextField
                        label="Новое имя"
                        fullWidth
                        value={newUsername}
                        onChange={(e) => setNewUsername(e.target.value)}
                        margin="normal"
                    />
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={handleUpdateUsername}
                        style={{ marginTop: 10 }}
                    >
                        Обновить имя
                    </Button>

                    <Button
                        variant="contained"
                        color="error"
                        onClick={handleLogout}
                        style={{ marginTop: 20 }}
                    >
                        Выйти
                    </Button>
                </div>
            ) : (
                <Typography variant="h6">Пожалуйста, войдите в систему</Typography>
            )}

            {/* Уведомление об успешном обновлении */}
            <Snackbar
                open={snackbarOpen}
                autoHideDuration={4000}
                onClose={() => setSnackbarOpen(false)}
            >
                <Alert severity="success" onClose={() => setSnackbarOpen(false)}>
                    {snackbarMessage}
                </Alert>
            </Snackbar>
        </Container>
    );
};

export default ProfilePage;