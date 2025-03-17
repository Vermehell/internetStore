import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  AppBar,
  Toolbar,
  Button,
  Typography,
  Container,
  Menu,
  MenuItem,
  Box,
} from '@mui/material';
import LoginModal from './LoginModal';
import RegistrationModal from './RegistrationModal';
import AuthRequiredModal from './AuthRequiredModal';
import api from '../api';

const Header = () => {
  const {
    user,
    logout,
    isLoginModalOpen,
    setIsLoginModalOpen,
    isRegistrationModalOpen,
    setIsRegistrationModalOpen,
    isAuthRequiredModalOpen,
    setIsAuthRequiredModalOpen,
  } = useAuth();
  const navigate = useNavigate();

  // Состояния для выпадающего меню категорий
  const [categories, setCategories] = useState([]);
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  // Загрузка категорий при монтировании компонента
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await api.get('/categories');
        setCategories(response.data);
      } catch (error) {
        console.error('Ошибка загрузки категорий:', error);
      }
    };
    fetchCategories();
  }, []);

  // Обработчик открытия меню
  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  // Обработчик закрытия меню
  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  // Обработчик выбора категории
  const handleCategoryClick = (categoryId) => {
    navigate(`/products?category=${categoryId}`);
    handleMenuClose();
  };

  return (
    <AppBar position="static">
      <Container maxWidth="lg">
        <Toolbar>
          {/* Логотип и название сайта */}
          <Typography
            variant="h6"
            component={Link}
            to="/"
            style={{ textDecoration: 'none', color: 'white', flexGrow: 1 }}
          >
            TechStore
          </Typography>

          {/* Кнопка "Категории" с выпадающим меню */}
          <Box>
            <Button
              color="inherit"
              onClick={handleMenuOpen}
              onMouseEnter={handleMenuOpen}
            >
              Категории
            </Button>
            <Menu
              anchorEl={anchorEl}
              open={open}
              onClose={handleMenuClose}
              MenuListProps={{ onMouseLeave: handleMenuClose }}
              PaperProps={{
                style: {
                  maxHeight: 300, // Максимальная высота меню
                  width: 200, // Ширина меню
                  overflowY: 'auto', // Вертикальная прокрутка
                  overflowX: 'hidden', // Убираем горизонтальную прокрутку
                },
              }}
            >
              {categories.map((category) => (
                <MenuItem
                  key={category.id}
                  onClick={() => handleCategoryClick(category.id)}
                  style={{
                    whiteSpace: 'normal', // Разрешаем перенос текста
                    wordWrap: 'break-word', // Перенос длинных слов
                  }}
                >
                  {category.name}
                </MenuItem>
              ))}
            </Menu>
          </Box>

          {/* Кнопка "Корзина" только для авторизованных пользователей */}
          {user && (
            <Button color="inherit" component={Link} to="/cart">
              Корзина
            </Button>
          )}

          {/* Кнопки для авторизованных и неавторизованных пользователей */}
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

        {/* Модальные окна */}
        <LoginModal
          open={isLoginModalOpen}
          onClose={() => setIsLoginModalOpen(false)}
        />
        <RegistrationModal
          open={isRegistrationModalOpen}
          onClose={() => setIsRegistrationModalOpen(false)}
        />
        <AuthRequiredModal
          open={isAuthRequiredModalOpen}
          onClose={() => setIsAuthRequiredModalOpen(false)}
          onLoginClick={() => {
            setIsAuthRequiredModalOpen(false);
            setIsLoginModalOpen(true);
          }}
          onRegisterClick={() => {
            setIsAuthRequiredModalOpen(false);
            setIsRegistrationModalOpen(true);
          }}
        />
      </Container>
    </AppBar>
  );
};

export default Header;