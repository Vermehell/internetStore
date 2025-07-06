import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { getMyOrders, getMyOrder } from '../api';
import {
    Container,
    Typography,
    Card,
    CardContent,
    Grid,
    Button,
    Chip,
    Box,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Alert,
    CircularProgress,
    Divider
} from '@mui/material';
import {
    ShoppingBag,
    Visibility,
    LocalShipping,
    Payment,
    Phone,
    LocationOn,
    AccessTime
} from '@mui/icons-material';

const OrdersPage = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [orderDialogOpen, setOrderDialogOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }
        loadOrders();
    }, [user, navigate]);

    const loadOrders = async () => {
        try {
            setLoading(true);
            const response = await getMyOrders();
            setOrders(response.data);
        } catch (error) {
            setError('Ошибка загрузки заказов');
            console.error('Ошибка загрузки заказов:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleViewOrder = async (orderId) => {
        try {
            const response = await getMyOrder(orderId);
            setSelectedOrder(response.data);
            setOrderDialogOpen(true);
        } catch (error) {
            setError('Ошибка загрузки деталей заказа');
            console.error('Ошибка загрузки деталей заказа:', error);
        }
    };

    const getStatusColor = (status) => {
        const statusColors = {
            'pending': 'warning',
            'confirmed': 'info',
            'processing': 'primary',
            'shipped': 'secondary',
            'delivered': 'success',
            'cancelled': 'error'
        };
        return statusColors[status] || 'default';
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

    const getDeliveryMethodText = (method) => {
        const methodMap = {
            'courier': 'Курьер',
            'pickup': 'Самовывоз',
            'post': 'Почта России'
        };
        return methodMap[method] || method;
    };

    const getPaymentMethodText = (method) => {
        const methodMap = {
            'cash': 'Наличными при получении',
            'card': 'Банковской картой',
            'online': 'Онлайн оплата'
        };
        return methodMap[method] || method;
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleString('ru-RU');
    };

    if (!user) {
        return null;
    }

    if (loading) {
        return (
            <Container maxWidth="md" sx={{ mt: 4, textAlign: 'center' }}>
                <CircularProgress />
            </Container>
        );
    }

    return (
        <Container maxWidth="lg" sx={{ mt: 4 }}>
            <Typography variant="h4" gutterBottom>
                Мои заказы
            </Typography>

            {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                </Alert>
            )}

            {orders.length === 0 ? (
                <Card>
                    <CardContent sx={{ textAlign: 'center', py: 4 }}>
                        <ShoppingBag sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                        <Typography variant="h5" gutterBottom>
                            У вас пока нет заказов
                        </Typography>
                        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                            Сделайте свой первый заказ, чтобы увидеть его здесь
                        </Typography>
                        <Button
                            variant="contained"
                            onClick={() => navigate('/')}
                            startIcon={<ShoppingBag />}
                        >
                            Перейти к покупкам
                        </Button>
                    </CardContent>
                </Card>
            ) : (
                <Grid container spacing={3}>
                    {orders.map((order) => (
                        <Grid item xs={12} key={order.id}>
                            <Card>
                                <CardContent>
                                    <Grid container spacing={2} alignItems="center">
                                        <Grid item xs={12} sm={3}>
                                            <Typography variant="h6" color="primary">
                                                №{order.order_number}
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                {formatDate(order.created_at)}
                                            </Typography>
                                        </Grid>
                                        <Grid item xs={12} sm={2}>
                                            <Typography variant="h6">
                                                {order.total_price} ₽
                                            </Typography>
                                        </Grid>
                                        <Grid item xs={12} sm={3}>
                                            <Chip
                                                label={getStatusText(order.status)}
                                                color={getStatusColor(order.status)}
                                                variant="outlined"
                                            />
                                        </Grid>
                                        <Grid item xs={12} sm={2}>
                                            <Typography variant="body2" color="text.secondary">
                                                Обновлен: {formatDate(order.updated_at)}
                                            </Typography>
                                        </Grid>
                                        <Grid item xs={12} sm={2}>
                                            <Button
                                                variant="outlined"
                                                startIcon={<Visibility />}
                                                onClick={() => handleViewOrder(order.id)}
                                                fullWidth
                                            >
                                                Подробности
                                            </Button>
                                        </Grid>
                                    </Grid>
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            )}

            {/* Диалог с деталями заказа */}
            <Dialog
                open={orderDialogOpen}
                onClose={() => setOrderDialogOpen(false)}
                maxWidth="md"
                fullWidth
            >
                {selectedOrder && (
                    <>
                        <DialogTitle>
                            <Box display="flex" alignItems="center" gap={1}>
                                <ShoppingBag />
                                Заказ №{selectedOrder.order_number}
                            </Box>
                        </DialogTitle>
                        <DialogContent>
                            <Grid container spacing={3}>
                                {/* Информация о заказе */}
                                <Grid item xs={12} md={6}>
                                    <Typography variant="h6" gutterBottom>
                                        Информация о заказе
                                    </Typography>
                                    <Box sx={{ mb: 2 }}>
                                        <Typography variant="body2" color="text.secondary">
                                            Статус
                                        </Typography>
                                        <Chip
                                            label={getStatusText(selectedOrder.status)}
                                            color={getStatusColor(selectedOrder.status)}
                                            sx={{ mt: 1 }}
                                        />
                                    </Box>
                                    <Box sx={{ mb: 2 }}>
                                        <Typography variant="body2" color="text.secondary">
                                            Общая стоимость
                                        </Typography>
                                        <Typography variant="h6" color="primary">
                                            {selectedOrder.total_price} ₽
                                        </Typography>
                                    </Box>
                                    <Box sx={{ mb: 2 }}>
                                        <Typography variant="body2" color="text.secondary">
                                            Дата создания
                                        </Typography>
                                        <Typography variant="body1">
                                            {formatDate(selectedOrder.created_at)}
                                        </Typography>
                                    </Box>
                                    <Box sx={{ mb: 2 }}>
                                        <Typography variant="body2" color="text.secondary">
                                            Последнее обновление
                                        </Typography>
                                        <Typography variant="body1">
                                            {formatDate(selectedOrder.updated_at)}
                                        </Typography>
                                    </Box>
                                </Grid>

                                {/* Информация о доставке */}
                                <Grid item xs={12} md={6}>
                                    <Typography variant="h6" gutterBottom>
                                        Информация о доставке
                                    </Typography>
                                    <Box sx={{ mb: 2 }}>
                                        <Box display="flex" alignItems="center" gap={1} sx={{ mb: 1 }}>
                                            <LocationOn fontSize="small" color="action" />
                                            <Typography variant="body2" color="text.secondary">
                                                Адрес доставки
                                            </Typography>
                                        </Box>
                                        <Typography variant="body1">
                                            {selectedOrder.delivery_address}
                                        </Typography>
                                    </Box>
                                    <Box sx={{ mb: 2 }}>
                                        <Box display="flex" alignItems="center" gap={1} sx={{ mb: 1 }}>
                                            <Phone fontSize="small" color="action" />
                                            <Typography variant="body2" color="text.secondary">
                                                Телефон
                                            </Typography>
                                        </Box>
                                        <Typography variant="body1">
                                            {selectedOrder.delivery_phone}
                                        </Typography>
                                    </Box>
                                    <Box sx={{ mb: 2 }}>
                                        <Box display="flex" alignItems="center" gap={1} sx={{ mb: 1 }}>
                                            <LocalShipping fontSize="small" color="action" />
                                            <Typography variant="body2" color="text.secondary">
                                                Способ доставки
                                            </Typography>
                                        </Box>
                                        <Typography variant="body1">
                                            {getDeliveryMethodText(selectedOrder.delivery_method)}
                                        </Typography>
                                    </Box>
                                    <Box sx={{ mb: 2 }}>
                                        <Box display="flex" alignItems="center" gap={1} sx={{ mb: 1 }}>
                                            <Payment fontSize="small" color="action" />
                                            <Typography variant="body2" color="text.secondary">
                                                Способ оплаты
                                            </Typography>
                                        </Box>
                                        <Typography variant="body1">
                                            {getPaymentMethodText(selectedOrder.payment_method)}
                                        </Typography>
                                    </Box>
                                    {selectedOrder.notes && (
                                        <Box sx={{ mb: 2 }}>
                                            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                                Дополнительные заметки
                                            </Typography>
                                            <Typography variant="body1">
                                                {selectedOrder.notes}
                                            </Typography>
                                        </Box>
                                    )}
                                </Grid>

                                {/* Товары в заказе */}
                                <Grid item xs={12}>
                                    <Divider sx={{ my: 2 }} />
                                    <Typography variant="h6" gutterBottom>
                                        Товары в заказе
                                    </Typography>
                                    <TableContainer component={Paper} variant="outlined">
                                        <Table>
                                            <TableHead>
                                                <TableRow>
                                                    <TableCell>Товар</TableCell>
                                                    <TableCell align="right">Цена</TableCell>
                                                    <TableCell align="right">Количество</TableCell>
                                                    <TableCell align="right">Сумма</TableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {selectedOrder.items?.map((item) => (
                                                    <TableRow key={item.id}>
                                                        <TableCell>
                                                            <Box display="flex" alignItems="center" gap={2}>
                                                                <img
                                                                    src={item.product?.image_url}
                                                                    alt={item.product?.name}
                                                                    style={{
                                                                        width: 50,
                                                                        height: 50,
                                                                        objectFit: 'cover',
                                                                        borderRadius: 4
                                                                    }}
                                                                />
                                                                <Box>
                                                                    <Typography variant="body1">
                                                                        {item.product?.name}
                                                                    </Typography>
                                                                    <Typography variant="body2" color="text.secondary">
                                                                        {item.product?.description}
                                                                    </Typography>
                                                                </Box>
                                                            </Box>
                                                        </TableCell>
                                                        <TableCell align="right">
                                                            {item.price} ₽
                                                        </TableCell>
                                                        <TableCell align="right">
                                                            {item.quantity}
                                                        </TableCell>
                                                        <TableCell align="right">
                                                            {item.price * item.quantity} ₽
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </TableContainer>
                                </Grid>
                            </Grid>
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={() => setOrderDialogOpen(false)}>
                                Закрыть
                            </Button>
                        </DialogActions>
                    </>
                )}
            </Dialog>
        </Container>
    );
};

export default OrdersPage; 