import { createContext, useContext, useState, useEffect } from 'react';
import api from '../api';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const { user } = useAuth();

  // Загрузка корзины при монтировании
  useEffect(() => {
    const fetchCart = async () => {
      if (user) {
        try {
          const response = await api.get('/cart/');
          setCartItems(response.data);
        } catch (error) {
          console.error('Ошибка загрузки корзины:', error);
        }
      }
    };
    fetchCart();
  }, [user]);

  // Функция для обновления корзины
  const updateCartItem = async (productId, quantity) => {
    try {
      if (quantity === 0) {
        await api.delete(`/cart/${productId}`);
      } else {
        await api.post('/cart/', { product_id: productId, quantity });
      }
      setCartItems(prev => 
        prev.map(item => 
          item.product_id === productId ? { ...item, quantity } : item
        ).filter(item => item.quantity > 0)
      );
    } catch (error) {
      console.error('Ошибка обновления корзины:', error);
    }
  };

  return (
    <CartContext.Provider value={{ cartItems, updateCartItem }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart должен использоваться внутри CartProvider');
  }
  return context;
};