import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000';

const api = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true, // Включаем отправку cookies
    headers: {
        'Content-Type': 'application/json',
    },
});

// Интерцептор для автоматического обновления токена
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            
            try {
                // Пытаемся обновить токен через cookies
                await api.post('/users/refresh');
                
                // Повторяем оригинальный запрос
                return api(originalRequest);
            } catch (refreshError) {
                // Если обновление не удалось, перенаправляем на логин
                window.location.href = '/';
            }
        }
        
        return Promise.reject(error);
    }
);

export const register = (userData) => api.post('/users/register', userData);
export const login = (userData) => api.post('/users/login', userData);
export const refreshToken = () => api.post('/users/refresh');

export const getProducts = (params = {}) => api.get('/products/', { params });
export const getProduct = (id) => api.get(`/products/${id}`);
export const createProduct = (productData) => api.post('/admin/products/', productData);
export const updateProduct = (id, productData) => api.put(`/admin/products/${id}`, productData);
export const deleteProduct = (id) => api.delete(`/admin/products/${id}`);

export const getCategories = () => api.get('/categories/');
export const createCategory = (categoryData) => api.post('/admin/categories/', categoryData);
export const updateCategory = (id, categoryData) => api.put(`/admin/categories/${id}`, categoryData);
export const deleteCategory = (id) => api.delete(`/admin/categories/${id}`);

export const getCart = () => api.get('/cart/');
export const addToCart = (item) => api.post('/cart/', item);
export const updateCartItem = (id, item) => api.put(`/cart/${id}`, item);
export const removeFromCart = (id) => api.delete(`/cart/${id}`);

export const createOrder = (orderData) => api.post('/orders/', orderData);
export const getMyOrders = (params = {}) => api.get('/orders/my', { params });
export const getMyOrder = (id) => api.get(`/orders/my/${id}`);

// Админские функции для заказов
export const getAllOrders = (params = {}) => api.get('/orders/admin', { params });
export const getOrderAdmin = (id) => api.get(`/orders/admin/${id}`);
export const updateOrderStatus = (id, status) => api.put(`/orders/admin/${id}/status?status=${status}`);
export const updateOrder = (id, orderData) => api.put(`/orders/admin/${id}`, orderData);
export const getOrderStatistics = () => api.get('/orders/admin/statistics');

export const getAllUsers = () => api.get('/admin/users/');
export const updateUserRole = (id, roleData) => api.put(`/admin/users/${id}/role`, roleData);
export const deleteUser = (id) => api.delete(`/admin/users/${id}`);

export default api;

export const updateProductWithSpecs = (productId, data) =>
  api.put(`/products/${productId}/with-specs`, data);