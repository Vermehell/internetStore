import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import Header from './components/Header';
import ProductsPage from './pages/ProductsPage';
import CartPage from './pages/CartPage';
import OrdersPage from './pages/OrdersPage';
import ProfilePage from './pages/ProfilePage';
import ProductDetailPage from './pages/ProductDetailPage';
import HomePage from './pages/HomePage';
import AdminPage from './pages/AdminPage';
import AdminCategoriesPage from './pages/AdminCategoriesPage';
import AdminUsersPage from './pages/AdminUsersPage';
import AdminOrdersPage from './pages/AdminOrdersPage';
import { CircularProgress, Box } from '@mui/material';

function AdminRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh"><CircularProgress /></Box>;
  if (!user) return <Navigate to="/" />;
  if (!user.is_admin) return <Navigate to="/" />;
  return children;
}

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <Header />
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/products" element={<ProductsPage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/orders" element={<OrdersPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/products/:productId" element={<ProductDetailPage />} />
            <Route path="/admin" element={<Navigate to="/admin/products" replace />} />
            <Route path="/admin/products" element={
              <AdminRoute>
                <AdminPage />
              </AdminRoute>
            } />
            <Route path="/admin/categories" element={
              <AdminRoute>
                <AdminCategoriesPage />
              </AdminRoute>
            } />
            <Route path="/admin/users" element={
              <AdminRoute>
                <AdminUsersPage />
              </AdminRoute>
            } />
            <Route path="/admin/orders" element={
              <AdminRoute>
                <AdminOrdersPage />
              </AdminRoute>
            } />
          </Routes>
        </Router>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;