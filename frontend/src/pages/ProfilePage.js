import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  Container, 
  Typography, 
  Button, 
  TextField, 
  Box,
  Snackbar,
  Alert
} from '@mui/material';
import api from '../api';
import { useNavigate } from 'react-router-dom';

const ProfilePage = () => {
  const { user, logout, login } = useAuth();
  const navigate = useNavigate();
  
  // Состояния для редактирования
  const [isEditing, setIsEditing] = useState(false);
  const [newUsername, setNewUsername] = useState(user?.username || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleUpdateProfile = async () => {
    try {
      let newToken = null;
  
      // Обновление имени пользователя
      if (newUsername !== user.username) {
        const response = await api.put(`/users/${user.id}/username`, { new_username: newUsername });
        console.log("Response from backend:", response.data); // Логируем ответ от бекенда
        
        // Сохраняем новый токен
        newToken = response.data.access_token;
        console.log("New token received:", newToken); // Логируем новый токен
  
        // Обновляем токен в куках
        document.cookie = `access_token=Bearer ${newToken}; path=/; max-age=1800; SameSite=Lax`;
        console.log("Cookie set with new token"); // Логируем установку куки
      }
  
      // Обновление пароля (если заполнено)
      if (newPassword) {
        await api.put(`/users/${user.id}/password`, {
          current_password: currentPassword,
          new_password: newPassword
        });
      }
  
      // Обновление данных в контексте
      const updatedUser = { ...user, username: newUsername };
      login(updatedUser, newToken); // Передаем новый токен в login
      console.log("User data updated in context"); // Логируем обновление контекста
      
      setSuccess('Данные успешно обновлены');
      setIsEditing(false);
      setCurrentPassword('');
      setNewPassword('');
  
    } catch (err) {
      console.error("Error updating profile:", err); // Логируем ошибку
      setError(err.response?.data?.detail || 'Ошибка обновления');
    }
  };

  return (
    <Container maxWidth="lg" style={{ padding: 20 }}>
      <Typography variant="h4" gutterBottom>
        Профиль пользователя
      </Typography>

      {user ? (
        <Box component="form" sx={{ maxWidth: 600 }}>
          {isEditing ? (
            <>
              <TextField
                label="Имя пользователя"
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
                fullWidth
                margin="normal"
              />

              <TextField
                label="Текущий пароль"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                fullWidth
                margin="normal"
              />

              <TextField
                label="Новый пароль"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                fullWidth
                margin="normal"
                helperText="Оставьте пустым, если не хотите менять"
              />

              <Box sx={{ mt: 2, gap: 2, display: 'flex' }}>
                <Button 
                  variant="contained" 
                  onClick={handleUpdateProfile}
                >
                  Сохранить
                </Button>
                <Button 
                  variant="outlined" 
                  onClick={() => {
                    setIsEditing(false);
                    setNewUsername(user.username);
                  }}
                >
                  Отмена
                </Button>
              </Box>
            </>
          ) : (
            <>
              <Typography variant="h6">Имя: {user.username}</Typography>
              <Typography variant="h6">Email: {user.email}</Typography>
              <Typography variant="h6" sx={{ mb: 3 }}>
                Статус: {user.is_admin ? 'Администратор' : 'Пользователь'}
              </Typography>

              <Button
                variant="contained"
                onClick={() => setIsEditing(true)}
                sx={{ mr: 2 }}
              >
                Редактировать профиль
              </Button>
            </>
          )}

          <Button
            variant="contained"
            color="error"
            onClick={() => {
              logout();
              navigate('/');
            }}
            sx={{ mt: 2 }}
          >
            Выйти
          </Button>
        </Box>
      ) : (
        <Typography variant="h6">Пожалуйста, войдите в систему</Typography>
      )}

      {/* Уведомления */}
      <Snackbar open={!!error} autoHideDuration={4000} onClose={() => setError('')}>
        <Alert severity="error">{error}</Alert>
      </Snackbar>

      <Snackbar open={!!success} autoHideDuration={4000} onClose={() => setSuccess('')}>
        <Alert severity="success">{success}</Alert>
      </Snackbar>
    </Container>
  );
};

export default ProfilePage;