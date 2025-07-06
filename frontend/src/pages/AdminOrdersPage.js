import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
    getAllOrders,
    getOrderAdmin,
    updateOrderStatus,
    getOrderStatistics
} from '../api';
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
    Divider,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    IconButton,
    Tooltip
} from '@mui/material';
import {
    ShoppingBag,
    Visibility,
    Edit,
    LocalShipping,
    Payment,
    Phone,
    LocationOn,
    TrendingUp,
    FilterList
} from '@mui/icons-material';

const AdminOrdersPage = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [orderDialogOpen, setOrderDialogOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [statistics, setStatistics] = useState(null);
    const [statusFilter, setStatusFilter] = useState('');

    useEffect(() => {
        if (!user || !user.is_admin) {
            navigate('/');
            return;
        }
        loadOrders();
        loadStatistics();
    }, [user, navigate, statusFilter]);

    const loadOrders = async () => {
        try {
            setLoading(true);
            const params = statusFilter ? { status: statusFilter } : {};
            const response = await getAllOrders(params);
            setOrders(response.data);
        } catch (error) {
            setError('Ошибка загрузки заказов');
            console.error('Ошибка загрузки заказов:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadStatistics = async () => {
        try {
            const response = await getOrderStatistics();
            setStatistics(response.data);
        } catch (error) {
            console.error('Ошибка загрузки статистики:', error);
        }
    };

    const handleViewOrder = async (orderId) => {
        try {
            const response = await getOrderAdmin(orderId);
            setSelectedOrder(response.data);
            setOrderDialogOpen(true);
        } catch (error) {
            setError('Ошибка загрузки деталей заказа');
            console.error('Ошибка загрузки деталей заказа:', error);
        }
    };

    const handleUpdateStatus = async (orderId, newStatus) => {
        try {
            await updateOrderStatus(orderId, newStatus);
            await loadOrders();
            await loadStatistics();
            setError('');
        } catch (error) {
            setError('Ошибка обновления статуса заказа');
            console.error('Ошибка обновления статуса заказа:', error);
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

    if (!user || !user.is_admin) {
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
        <Container maxWidth="xl" sx={{ mt: 4 }}>
            <Typography variant="h4" gutterBottom>
                Управление заказами
            </Typography>

            {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                </Alert>
            )}

            {/* Статистика */}
            {statistics && (
                <Grid container spacing={3} sx={{ mb: 4 }}>
                    <Grid item xs={12} sm={6} md={3}>
                        <Card>
                            <CardContent>
                                <Box display="flex" alignItems="center" gap={2}>
                                    <TrendingUp color="primary" />
                                    <Box>
                                        <Typography variant="h6">{statistics.total_orders}</Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            Всего заказов
                                        </Typography>
                                    </Box>
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <Card>
                            <CardContent>
                                <Box display="flex" alignItems="center" gap={2}>
                                    <Chip label={statistics.pending_orders} color="warning" />
                                    <Box>
                                        <Typography variant="h6">{statistics.pending_orders}</Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            Ожидают подтверждения
                                        </Typography>
                                    </Box>
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <Card>
                            <CardContent>
                                <Box display="flex" alignItems="center" gap={2}>
                                    <Chip label={statistics.delivered_orders} color="success" />
                                    <Box>
                                        <Typography variant="h6">{statistics.delivered_orders}</Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            Доставлено
                                        </Typography>
                                    </Box>
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <Card>
                            <CardContent>
                                <Box display="flex" alignItems="center" gap={2}>
                                    <Typography variant="h6" color="primary">
                                        {statistics.total_revenue} ₽
                                    </Typography>
                                    <Box>
                                        <Typography variant="h6">{statistics.total_revenue} ₽</Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            Общая выручка
                                        </Typography>
                                    </Box>
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
            )}

            {/* Фильтр по статусу */}
            <Box sx={{ mb: 3 }}>
                <FormControl sx={{ minWidth: 200 }}>
                    <InputLabel>Фильтр по статусу</InputLabel>
                    <Select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        label="Фильтр по статусу"
                        startAdornment={<FilterList />}
                    >
                        <MenuItem value="">Все заказы</MenuItem>
                        <MenuItem value="pending">Ожидают подтверждения</MenuItem>
                        <MenuItem value="confirmed">Подтверждены</MenuItem>
                        <MenuItem value="processing">В обработке</MenuItem>
                        <MenuItem value="shipped">Отправлены</MenuItem>
                        <MenuItem value="delivered">Доставлены</MenuItem>
                        <MenuItem value="cancelled">Отменены</MenuItem>
                    </Select>
                </FormControl>
            </Box>

            {/* Список заказов */}
            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Номер заказа</TableCell>
                            <TableCell>Дата создания</TableCell>
                            <TableCell>Сумма</TableCell>
                            <TableCell>Статус</TableCell>
                            <TableCell>Способ доставки</TableCell>
                            <TableCell>Способ оплаты</TableCell>
                            <TableCell>Действия</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {orders.map((order) => (
                            <TableRow key={order.id}>
                                <TableCell>
                                    <Typography variant="body1" fontWeight="bold">
                                        №{order.order_number}
                                    </Typography>
                                </TableCell>
                                <TableCell>{formatDate(order.created_at)}</TableCell>
                                <TableCell>
                                    <Typography variant="body1" fontWeight="bold">
                                        {order.total_price} ₽
                                    </Typography>
                                </TableCell>
                                <TableCell>
                                    <Chip
                                        label={getStatusText(order.status)}
                                        color={getStatusColor(order.status)}
                                        size="small"
                                    />
                                </TableCell>
                                <TableCell>{getDeliveryMethodText(order.delivery_method)}</TableCell>
                                <TableCell>{getPaymentMethodText(order.payment_method)}</TableCell>
                                <TableCell>
                                    <Box display="flex" gap={1}>
                                        <Tooltip title="Просмотреть детали">
                                            <IconButton
                                                size="small"
                                                onClick={() => handleViewOrder(order.id)}
                                            >
                                                <Visibility />
                                            </IconButton>
                                        </Tooltip>
                                        <FormControl size="small" sx={{ minWidth: 120 }}>
                                            <Select
                                                value={order.status}
                                                onChange={(e) => handleUpdateStatus(order.id, e.target.value)}
                                                size="small"
                                            >
                                                <MenuItem value="pending">Ожидает</MenuItem>
                                                <MenuItem value="confirmed">Подтвержден</MenuItem>
                                                <MenuItem value="processing">В обработке</MenuItem>
                                                <MenuItem value="shipped">Отправлен</MenuItem>
                                                <MenuItem value="delivered">Доставлен</MenuItem>
                                                <MenuItem value="cancelled">Отменен</MenuItem>
                                            </Select>
                                        </FormControl>
                                    </Box>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

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

export default AdminOrdersPage; 