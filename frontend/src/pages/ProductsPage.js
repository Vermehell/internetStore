import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../api/index';
import ProductCard from '../components/ProductCard';
import { Grid, Container, Typography, CircularProgress } from '@mui/material';

const ProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user, setIsAuthRequiredModalOpen } = useAuth();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await api.get('/products');
        setProducts(response.data);
      } catch (error) {
        console.error('Ошибка загрузки товаров:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const addToCart = async (productId) => {
    if (!user) {
      setIsAuthRequiredModalOpen(true); // Открываем модальное окно с требованием авторизации
      return;
    }

    try {
      await api.post('/cart/', { product_id: productId, quantity: 1 });
      console.log('Товар добавлен в корзину');
    } catch (error) {
      console.error('Ошибка:', error.response?.data);
    }
  };

  return (
    <Container maxWidth="lg" style={{ padding: 20 }}>
      <Typography variant="h4" gutterBottom>
        Каталог товаров
      </Typography>
      {loading ? (
        <CircularProgress />
      ) : (
        <Grid container spacing={3}>
          {products.map((product) => (
            <Grid item xs={12} sm={6} md={4} key={product.id}>
              <ProductCard
                product={product}
                onAddToCart={() => addToCart(product.id)}
              />
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
};

export default ProductsPage;