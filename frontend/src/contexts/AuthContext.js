import { createContext, useContext, useState, useEffect } from 'react';
import api from '../api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false); // Состояние для модального окна входа
  const [isRegistrationModalOpen, setIsRegistrationModalOpen] = useState(false); // Состояние для модального окна регистрации
  const [isAuthRequiredModalOpen, setIsAuthRequiredModalOpen] = useState(false); // Состояние для модального окна "Требуется авторизация"

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await api.get('/users/me');
        setUser(response.data);
      } catch (error) {
        console.error('Ошибка загрузки пользователя:', error);
      }
    };
    fetchUser();
  }, []);

  const login = (userData, token) => {
    setUser(userData);
    if (token) {
      // Сохраняем токен в куках
      document.cookie = `access_token=Bearer ${token}; path=/; max-age=1800; SameSite=Lax`;
    }
  };

  const logout = async () => {
    try {
      await api.post('/users/logout');
      setUser(null);
    } catch (error) {
      console.error('Ошибка выхода:', error);
    }
  };

  const updateUser = (updatedData) => {
    setUser(prev => ({ ...prev, ...updatedData }));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        isLoginModalOpen,
        setIsLoginModalOpen,
        isRegistrationModalOpen,
        setIsRegistrationModalOpen,
        isAuthRequiredModalOpen,
        setIsAuthRequiredModalOpen, // Передаем состояние и функцию для управления модальным окном "Требуется авторизация"
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);