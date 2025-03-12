import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Container, Typography, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const ProfilePage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
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
    </Container>
  );
};

export default ProfilePage;