import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
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
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';

const CartPage = () => {
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();
    const { cartItems, incrementQuantity, decrementQuantity, loadCart } = useCart(); // Добавьте loadCart
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');

    useEffect(() => {
        if (user) {
            setLoading(false);
        }
    }, [user]);

    const removeItem = async (itemId) => {
      try {
          await api.delete(`/cart/${itemId}`);
          await loadCart(); // Перезагружаем корзину после удаления
          setSnackbarMessage('Товар удалён из корзины');
          setSnackbarOpen(true);
      } catch (error) {
          console.error('Ошибка удаления:', error);
          setSnackbarMessage('Ошибка удаления товара');
          setSnackbarOpen(true);
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

                                <TableCell>
                                    <IconButton onClick={() => decrementQuantity(item.product_id)}>
                                        <RemoveIcon />
                                    </IconButton>
                                    {item.quantity}
                                    <IconButton onClick={() => incrementQuantity(item.product_id)}>
                                        <AddIcon />
                                    </IconButton>
                                </TableCell>

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