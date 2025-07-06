import { createContext, useContext, useState, useEffect } from 'react';
import api from '../api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isRegistrationModalOpen, setIsRegistrationModalOpen] = useState(false);
  const [isAuthRequiredModalOpen, setIsAuthRequiredModalOpen] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await api.get('/users/me');
        setUser(response.data);
      } catch (error) {
        console.error('Ошибка загрузки пользователя:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  const login = (userData) => {
    setUser(userData);
  };

  const logout = async () => {
    try {
      await api.post('/users/logout');
      setUser(null);
    } catch (error) {
      console.error('Ошибка выхода:', error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        isLoginModalOpen,
        setIsLoginModalOpen,
        isRegistrationModalOpen,
        setIsRegistrationModalOpen,
        isAuthRequiredModalOpen,
        setIsAuthRequiredModalOpen,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);