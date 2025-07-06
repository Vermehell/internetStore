import React, { useState, useEffect } from 'react';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
    Container,
    Typography,
    Card,
    CardContent,
    Grid,
    Button,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Box,
    Alert,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    IconButton,
    Divider
} from '@mui/material';
import { Add, Remove, Delete, ShoppingCart, LocalShipping, Payment } from '@mui/icons-material';

const CartPage = () => {
    const { cartItems, incrementQuantity, decrementQuantity, removeFromCart, createOrderFromCart } = useCart();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [orderDialogOpen, setOrderDialogOpen] = useState(false);
    const [orderForm, setOrderForm] = useState({
        delivery_address: '',
        delivery_phone: '',
        delivery_method: 'courier',
        payment_method: 'cash',
        notes: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        if (!user) {
            navigate('/login');
        }
    }, [user, navigate]);

    const totalPrice = cartItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);

    const handleOrderFormChange = (field, value) => {
        setOrderForm(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleCreateOrder = async () => {
        if (!orderForm.delivery_address || !orderForm.delivery_phone) {
            setError('Пожалуйста, заполните адрес доставки и телефон');
            return;
        }

        setLoading(true);
        setError('');
        
        try {
            const order = await createOrderFromCart(orderForm);
            setSuccess(`Заказ №${order.order_number} успешно создан!`);
            setOrderDialogOpen(false);
            setOrderForm({
                delivery_address: '',
                delivery_phone: '',
                delivery_method: 'courier',
                payment_method: 'cash',
                notes: ''
            });
        } catch (error) {
            setError(error.response?.data?.detail || 'Ошибка при создании заказа');
        } finally {
            setLoading(false);
        }
    };

    const getStatusText = (status) => {
        const statusMap = {
            'pending': 'Ожидает подтверждения',
            'confirmed': 'Подтвержден',
            'processing': 'В обработке',
            'shipped': 'Отправлен',
            'delivered': 'Доставлен',
            'cancelled': 'Отменен'
        };
        return statusMap[status] || status;
    };

    if (!user) {
        return null;
    }

    if (cartItems.length === 0) {
        return (
            <Container maxWidth="md" sx={{ mt: 4 }}>
                <Card>
                    <CardContent sx={{ textAlign: 'center', py: 4 }}>
                        <ShoppingCart sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                        <Typography variant="h5" gutterBottom>
                            Корзина пуста
                        </Typography>
                        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                            Добавьте товары в корзину для оформления заказа
                        </Typography>
                        <Button
                            variant="contained"
                            onClick={() => navigate('/')}
                            startIcon={<ShoppingCart />}
                        >
                            Перейти к покупкам
                        </Button>
                    </CardContent>
                </Card>
            </Container>
        );
    }

    return (
        <Container maxWidth="lg" sx={{ mt: 4 }}>
            <Typography variant="h4" gutterBottom>
                Корзина
            </Typography>

            {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                </Alert>
            )}

            {success && (
                <Alert severity="success" sx={{ mb: 2 }}>
                    {success}
                </Alert>
            )}

            <Grid container spacing={3}>
                <Grid item xs={12} md={8}>
                    {cartItems.map((item) => (
                        <Card key={item.id} sx={{ mb: 2 }}>
                            <CardContent>
                                <Grid container spacing={2} alignItems="center">
                                    <Grid item xs={12} sm={3}>
                                        <img
                                            src={item.product.image_url}
                                            alt={item.product.name}
                                            style={{
                                                width: '100%',
                                                height: 100,
                                                objectFit: 'cover',
                                                borderRadius: 8
                                            }}
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={4}>
                                        <Typography variant="h6" gutterBottom>
                                            {item.product.name}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            {item.product.description}
                                        </Typography>
                                    </Grid>
                                    <Grid item xs={12} sm={2}>
                                        <Typography variant="h6" color="primary">
                                            {item.product.price} ₽
                                        </Typography>
                                    </Grid>
                                    <Grid item xs={12} sm={2}>
                                        <Box display="flex" alignItems="center" gap={1}>
                                            <IconButton
                                                size="small"
                                                onClick={() => decrementQuantity(item.product_id)}
                                                disabled={item.quantity <= 1}
                                            >
                                                <Remove />
                                            </IconButton>
                                            <Typography variant="body1">
                                                {item.quantity}
                                            </Typography>
                                            <IconButton
                                                size="small"
                                                onClick={() => incrementQuantity(item.product_id)}
                                            >
                                                <Add />
                                            </IconButton>
                                        </Box>
                                    </Grid>
                                    <Grid item xs={12} sm={1}>
                                        <IconButton
                                            color="error"
                                            onClick={() => removeFromCart(item.id)}
                                        >
                                            <Delete />
                                        </IconButton>
                                    </Grid>
                                </Grid>
                            </CardContent>
                        </Card>
                    ))}
                </Grid>

                <Grid item xs={12} md={4}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                Итого
                            </Typography>
                            <Divider sx={{ my: 2 }} />
                            <Box display="flex" justifyContent="space-between" mb={2}>
                                <Typography>Товары ({cartItems.length}):</Typography>
                                <Typography>{totalPrice} ₽</Typography>
                            </Box>
                            <Divider sx={{ my: 2 }} />
                            <Box display="flex" justifyContent="space-between" mb={3}>
                                <Typography variant="h6">Итого к оплате:</Typography>
                                <Typography variant="h6" color="primary">
                                    {totalPrice} ₽
                                </Typography>
                            </Box>
                            <Button
                                variant="contained"
                                fullWidth
                                size="large"
                                onClick={() => setOrderDialogOpen(true)}
                                startIcon={<LocalShipping />}
                            >
                                Оформить заказ
                            </Button>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* Диалог оформления заказа */}
            <Dialog
                open={orderDialogOpen}
                onClose={() => setOrderDialogOpen(false)}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle>
                    <Box display="flex" alignItems="center" gap={1}>
                        <LocalShipping />
                        Оформление заказа
                    </Box>
                </DialogTitle>
                <DialogContent>
                    <Grid container spacing={2} sx={{ mt: 1 }}>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Адрес доставки"
                                value={orderForm.delivery_address}
                                onChange={(e) => handleOrderFormChange('delivery_address', e.target.value)}
                                multiline
                                rows={3}
                                required
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Телефон для доставки"
                                value={orderForm.delivery_phone}
                                onChange={(e) => handleOrderFormChange('delivery_phone', e.target.value)}
                                required
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <FormControl fullWidth>
                                <InputLabel>Способ доставки</InputLabel>
                                <Select
                                    value={orderForm.delivery_method}
                                    onChange={(e) => handleOrderFormChange('delivery_method', e.target.value)}
                                    label="Способ доставки"
                                >
                                    <MenuItem value="courier">Курьер</MenuItem>
                                    <MenuItem value="pickup">Самовывоз</MenuItem>
                                    <MenuItem value="post">Почта России</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <FormControl fullWidth>
                                <InputLabel>Способ оплаты</InputLabel>
                                <Select
                                    value={orderForm.payment_method}
                                    onChange={(e) => handleOrderFormChange('payment_method', e.target.value)}
                                    label="Способ оплаты"
                                >
                                    <MenuItem value="cash">Наличными при получении</MenuItem>
                                    <MenuItem value="card">Банковской картой</MenuItem>
                                    <MenuItem value="online">Онлайн оплата</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Дополнительные заметки"
                                value={orderForm.notes}
                                onChange={(e) => handleOrderFormChange('notes', e.target.value)}
                                multiline
                                rows={2}
                            />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOrderDialogOpen(false)}>
                        Отмена
                    </Button>
                    <Button
                        onClick={handleCreateOrder}
                        variant="contained"
                        disabled={loading}
                        startIcon={<Payment />}
                    >
                        {loading ? 'Создание заказа...' : 'Создать заказ'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default CartPage;