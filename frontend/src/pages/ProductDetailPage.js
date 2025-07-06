import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CircularProgress,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Alert,
  Button,
  IconButton,
  Box,
} from '@mui/material';
import { Add, Remove } from '@mui/icons-material';
import api from '../api';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import AuthRequiredModal from '../components/AuthRequiredModal';

const ProductDetailPage = () => {
  const { productId } = useParams();
  const [product, setProduct] = useState(null);
  const [specs, setSpecs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { addToCart, cartItems, incrementQuantity, decrementQuantity } = useCart();
  const { user, setIsAuthRequiredModalOpen, isAuthRequiredModalOpen, setIsLoginModalOpen, setIsRegistrationModalOpen } = useAuth();
  const [adding, setAdding] = useState(false);
  const productCartItem = cartItems.find(item => item.product_id === product?.id);
  const quantity = productCartItem?.quantity || 0;

  useEffect(() => {
    const fetchProductDetails = async () => {
      try {
        const productResponse = await api.get(`/products/${productId}`);
        const specsResponse = await api.get(`/products/${productId}/specs`);
        setProduct(productResponse.data);
        setSpecs(specsResponse.data);
      } catch (error) {
        console.error('Ошибка загрузки данных:', error);
        setError('Не удалось загрузить данные о товаре');
      } finally {
        setLoading(false);
      }
    };
    fetchProductDetails();
  }, [productId]);

  const handleAddToCart = async () => {
    if (!user) {
      setIsAuthRequiredModalOpen(true);
      return;
    }
    setAdding(true);
    try {
      await addToCart(product.id, 1);
    } catch (e) {
      // Можно добавить обработку ошибки
    } finally {
      setAdding(false);
    }
  };

  if (loading) {
    return (
      <Container maxWidth="lg" style={{ padding: 20, textAlign: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" style={{ padding: 20 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  if (!product) {
    return (
      <Container maxWidth="lg" style={{ padding: 20 }}>
        <Typography variant="h5">Товар не найден</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" style={{ padding: 20 }}>
      <Grid container spacing={4}>
        <Grid item xs={12} md={6}>
          <div className="product-page-image">
            <img
              src={product.image_url || '/images/products/placeholder.jpg'}
              alt={product.name}
              className="product-image"
            />
          </div>
        </Grid>
        <Grid item xs={12} md={6}>
          <CardContent>
            <Typography variant="h3" gutterBottom>{product.name}</Typography>
            <Typography variant="body1" paragraph>{product.description}</Typography>
            <Typography variant="h4" color="primary" gutterBottom>
              {product.price.toLocaleString('ru-RU')} ₽
            </Typography>
            <Typography variant="h5" gutterBottom>Характеристики:</Typography>
            {specs.length > 0 ? (
              <TableContainer component={Paper} style={{ marginBottom: 16 }}>
                <Table>
                  <TableBody>
                    {specs.map((spec) => (
                      <TableRow key={spec.id}>
                        <TableCell><strong>{spec.spec_name}</strong></TableCell>
                        <TableCell>{spec.spec_value}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Typography variant="body1" color="textSecondary">
                Характеристики отсутствуют.
              </Typography>
            )}
            {quantity > 0 ? (
              <Box display="flex" alignItems="center" sx={{ mt: 2, mb: 1 }}>
                <IconButton
                  onClick={async () => { await decrementQuantity(product.id); }}
                  size="small"
                  color="primary"
                  sx={{ mr: 1 }}
                >
                  <Remove />
                </IconButton>
                <Typography variant="h6">{quantity}</Typography>
                <IconButton
                  onClick={async () => { await incrementQuantity(product.id); }}
                  size="small"
                  color="primary"
                  sx={{ ml: 1 }}
                >
                  <Add />
                </IconButton>
              </Box>
            ) : (
              <Button
                variant="contained"
                color="primary"
                onClick={handleAddToCart}
                disabled={adding}
                sx={{ mt: 2 }}
              >
                {adding ? 'Добавление...' : 'В корзину'}
              </Button>
            )}
          </CardContent>
        </Grid>
      </Grid>
      <AuthRequiredModal
        open={isAuthRequiredModalOpen}
        onClose={() => setIsAuthRequiredModalOpen(false)}
        onLoginClick={() => {
          setIsAuthRequiredModalOpen(false);
          setIsLoginModalOpen(true);
        }}
        onRegisterClick={() => {
          setIsAuthRequiredModalOpen(false);
          setIsRegistrationModalOpen(true);
        }}
      />
    </Container>
  );
};

export default ProductDetailPage;