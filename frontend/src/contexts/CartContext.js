import { createContext, useContext, useState, useEffect } from 'react';
import api from '../api';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
    const [cartItems, setCartItems] = useState([]);
    const { user } = useAuth();

    useEffect(() => {
        if (user) loadCart();
    }, [user]);

    const loadCart = async () => {
        try {
            const response = await api.get('/cart/');
            const itemsWithProducts = await Promise.all(
                response.data.map(async (item) => {
                    const productResponse = await api.get(`/products/${item.product_id}`);
                    return { ...item, product: productResponse.data };
                })
            );
            setCartItems(itemsWithProducts);
        } catch (error) {
            console.error('Ошибка загрузки корзины:', error);
        }
    };

    const addToCart = async (productId, quantity) => {
        try {
          const cartItem = cartItems.find(item => item.product_id === productId);
          if (cartItem) {
            await api.put(`/cart/${cartItem.id}`, { quantity: cartItem.quantity + quantity });
            setCartItems(prevItems =>
              prevItems.map(item =>
                item.product_id === productId
                  ? { ...item, quantity: item.quantity + quantity }
                  : item
              )
            );
          } else {
            const response = await api.post('/cart/', { 
              product_id: productId, 
              quantity: quantity 
            });
            const productResponse = await api.get(`/products/${productId}`);
            setCartItems(prevItems => [
              ...prevItems,
              { ...response.data, product: productResponse.data },
            ]);
          }
        } catch (error) {
          console.error('Ошибка добавления товара:', error.response?.data);
          throw error;
        }
      };

    const incrementQuantity = async (productId) => {
        try {
          const cartItem = cartItems.find(item => item.product_id === productId);
          if (cartItem) {
            const newQuantity = cartItem.quantity + 1;
            await api.put(`/cart/${cartItem.id}`, { quantity: newQuantity });
            setCartItems(prevItems =>
              prevItems.map(item =>
                item.product_id === productId
                  ? { ...item, quantity: newQuantity }
                  : item
              )
            );
          }
        } catch (error) {
          console.error('Ошибка увеличения количества:', error);
        }
      };
      
      const decrementQuantity = async (productId) => {
        try {
          const cartItem = cartItems.find(item => item.product_id === productId);
          if (cartItem) {
            const newQuantity = cartItem.quantity - 1;
            if (newQuantity > 0) {
              await api.put(`/cart/${cartItem.id}`, { quantity: newQuantity });
              setCartItems(prevItems =>
                prevItems.map(item =>
                  item.product_id === productId
                    ? { ...item, quantity: newQuantity }
                    : item
                )
              );
            } else {
              await api.delete(`/cart/${cartItem.id}`);
              setCartItems(prevItems =>
                prevItems.filter(item => item.product_id !== productId)
              );
            }
          }
        } catch (error) {
          console.error('Ошибка уменьшения количества:', error);
        }
      };

    const removeFromCart = async (cartItemId) => {
        try {
            await api.delete(`/cart/${cartItemId}`);
            setCartItems(prevItems =>
                prevItems.filter(item => item.id !== cartItemId)
            );
        } catch (error) {
            console.error('Ошибка удаления товара из корзины:', error);
        }
    };

    return (
        <CartContext.Provider value={{ cartItems, loadCart, addToCart, decrementQuantity, incrementQuantity, removeFromCart }}>
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