import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Container, Typography, Button, TextField, Snackbar, Alert, Box, Paper } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import api from '../api';

const ProfilePage = () => {
    const { user, logout, login } = useAuth();
    const navigate = useNavigate();
    const [newUsername, setNewUsername] = useState(user?.username || ''); // Изначально имя пользователя
    const [isEditing, setIsEditing] = useState(false); // Состояние для режима редактирования
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [error, setError] = useState('');

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const handleUpdateUsername = async () => {
        // Валидация имени на фронтенде
        if (newUsername.length < 3 || newUsername.length > 50) {
            setError('Имя должно быть от 3 до 50 символов');
            return;
        }

        try {
            const response = await api.put(`/users/${user.id}/username`, {
                new_username: newUsername,
            });

            // Обновляем данные пользователя в контексте
            login(response.data); // Обновляем контекст с новыми данными

            setSnackbarMessage('Имя успешно обновлено');
            setSnackbarOpen(true);
            setError(''); // Очищаем ошибку
            setIsEditing(false); // Выходим из режима редактирования
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
                <Paper elevation={3} style={{ padding: 20, marginTop: 20 }}>
                    <Typography variant="h6">Логин: {user.login}</Typography>
                    <Typography variant="h6">Имя: {user.username}</Typography>
                    <Typography variant="h6">Email: {user.email}</Typography>
                    <Typography variant="h6" style={{ marginBottom: 20 }}>
                        Статус: {user.is_admin ? 'Администратор' : 'Пользователь'}
                    </Typography>

                    {/* Поле редактирования имени */}
                    {isEditing && (
                        <Box marginBottom={2}>
                            <TextField
                                label="Новое имя"
                                fullWidth
                                value={newUsername}
                                onChange={(e) => setNewUsername(e.target.value)}
                                margin="normal"
                                error={!!error}
                                helperText={error}
                            />
                        </Box>
                    )}

                    {/* Кнопки управления */}
                    <Box display="flex" gap={2} marginTop={2}>
                        {isEditing ? (
                            <>
                                <Button
                                    variant="contained"
                                    color="primary"
                                    onClick={handleUpdateUsername}
                                >
                                    Сохранить
                                </Button>
                                <Button
                                    variant="outlined"
                                    color="secondary"
                                    onClick={() => setIsEditing(false)}
                                >
                                    Отмена
                                </Button>
                            </>
                        ) : (
                            <Button
                                variant="contained"
                                color="primary"
                                onClick={() => setIsEditing(true)}
                            >
                                Редактировать профиль
                            </Button>
                        )}
                        <Button
                            variant="contained"
                            color="error"
                            onClick={handleLogout}
                        >
                            Выйти
                        </Button>
                    </Box>
                </Paper>
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