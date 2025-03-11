import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { AppBar, Toolbar, Button, Typography, Container } from '@mui/material';
import LoginModal from './LoginModal';
import RegistrationModal from './RegistrationModal';
import AuthRequiredModal from './AuthRequiredModal'; // Новое модальное окно

const Header = () => {
  const { user, logout, isLoginModalOpen, setIsLoginModalOpen, isRegistrationModalOpen, setIsRegistrationModalOpen, isAuthRequiredModalOpen, setIsAuthRequiredModalOpen } = useAuth();
  const navigate = useNavigate();

  return (
    <AppBar position="static">
      <Container maxWidth="lg">
        <Toolbar>
          <Typography
            variant="h6"
            component={Link}
            to="/"
            style={{ textDecoration: 'none', color: 'white', flexGrow: 1 }}
          >
            TechStore
          </Typography>

          {/* Кнопка "Товары" для всех пользователей */}
          <Button color="inherit" component={Link} to="/products">
            Товары
          </Button>

          {/* Кнопка "Корзина" только для авторизованных */}
          {user && (
            <Button color="inherit" component={Link} to="/cart">
              Корзина
            </Button>
          )}

          {user ? (
            <>
              <Button color="inherit" onClick={() => navigate('/profile')}>
                Профиль
              </Button>
            </>
          ) : (
            <>
              <Button
                color="inherit"
                onClick={() => setIsRegistrationModalOpen(true)}
              >
                Зарегистрироваться
              </Button>
              <Button
                color="inherit"
                onClick={() => setIsLoginModalOpen(true)}
              >
                Вход
              </Button>
            </>
          )}
        </Toolbar>
      </Container>

      {/* Модальное окно входа */}
      <LoginModal
        open={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
      />

      {/* Модальное окно регистрации */}
      <RegistrationModal
        open={isRegistrationModalOpen}
        onClose={() => setIsRegistrationModalOpen(false)}
      />

      {/* Новое модальное окно с требованием авторизации */}
      <AuthRequiredModal
        open={isAuthRequiredModalOpen}
        onClose={() => setIsAuthRequiredModalOpen(false)}
        onLoginClick={() => {
          setIsAuthRequiredModalOpen(false); // Закрываем текущее окно
          setIsLoginModalOpen(true); // Открываем окно входа
        }}
        onRegisterClick={() => {
          setIsAuthRequiredModalOpen(false); // Закрываем текущее окно
          setIsRegistrationModalOpen(true); // Открываем окно регистрации
        }}
      />
    </AppBar>
  );
};

export default Header;