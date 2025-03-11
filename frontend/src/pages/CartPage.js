import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../api/index';
import { 
  Container, 
  Typography, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Paper, 
  IconButton, 
  Button,
  CircularProgress,
  Snackbar,
  Alert
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';

const CartPage = () => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  useEffect(() => {
    if (user) {
      const fetchCart = async () => {
        try {
          // Получаем данные корзины
          const cartResponse = await api.get('/cart/');
          const cartItems = cartResponse.data;

          // Для каждого элемента корзины получаем информацию о товаре
          const itemsWithProducts = await Promise.all(
            cartItems.map(async (item) => {
              const productResponse = await api.get(`/products/${item.product_id}`);
              return {
                ...item,
                product: productResponse.data,
              };
            })
          );

          setCartItems(itemsWithProducts);
        } catch (error) {
          console.error('Ошибка загрузки корзины:', error);
        } finally {
          setLoading(false);
        }
      };
      fetchCart();
    }
  }, [user]);

  const fetchCart = async () => {
    try {
      const response = await api.get('/cart/');
      setCartItems(response.data);
    } catch (error) {
      console.error('Ошибка загрузки корзины:', error);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (productId) => {
    try {
      await api.post('/cart/', {
        product_id: productId,
        quantity: 1,
      });
      setSnackbarMessage('Товар добавлен в корзину');
      setSnackbarOpen(true);
      fetchCart(); // Обновляем корзину после добавления товара
    } catch (error) {
      console.error('Ошибка добавления товара:', error);
      setSnackbarMessage('Ошибка добавления товара');
      setSnackbarOpen(true);
    }
  };

  const removeItem = async (itemId) => {
    try {
      await api.delete(`/cart/${itemId}`);
      setCartItems(cartItems.filter(item => item.id !== itemId));
    } catch (error) {
      console.error('Ошибка удаления:', error);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
    }).format(price);
  };

  if (loading) return <CircularProgress />;
  if (!cartItems?.length) return <Typography>Корзина пуста</Typography>;

  return (
    <Container maxWidth="lg" style={{ padding: 20 }}>
      <Typography variant="h4" gutterBottom>Корзина</Typography>
      
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Товар</TableCell>
              <TableCell>Количество</TableCell>
              <TableCell>Цена</TableCell>
              <TableCell>Действия</TableCell>
            </TableRow>
          </TableHead>
          
          <TableBody>
            {cartItems.map((item) => (
              <TableRow key={item.id}>
                <TableCell>
                  {item.product?.name || "Неизвестный товар"}
                </TableCell>
                
                <TableCell>{item.quantity}</TableCell>
                
                <TableCell>
                  {item.product?.price 
                    ? formatPrice(item.product.price * item.quantity)
                    : "—"
                  }
                </TableCell>
                
                <TableCell>
                  <IconButton onClick={() => removeItem(item.id)}>
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <div style={{ marginTop: 20 }}>
        <Typography variant="h6">
          Итого: {formatPrice(
            cartItems.reduce(
              (sum, item) => sum + (item.product?.price || 0) * item.quantity,
              0
            )
          )}
        </Typography>
        
        <Button
          variant="contained"
          color="primary"
          style={{ marginTop: 10 }}
        >
          Оформить заказ
        </Button>
      </div>

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

export default CartPage;