import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext'; 
import api from '../api/index'; 
import ProductCard from '../components/ProductCard'; 
import { Grid, Container, Typography, CircularProgress, Alert } from '@mui/material';

const ProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true); 
  const [categoryName, setCategoryName] = useState(''); 
  const [error, setError] = useState(null); 
  const [searchParams] = useSearchParams(); 
  const categoryId = searchParams.get('category'); 

  useEffect(() => {
    const fetchData = async () => {
      try {
        const productsUrl = categoryId 
          ? `/products?category_id=${categoryId}`
          : '/products';
        const productsResponse = await api.get(productsUrl);
        setProducts(productsResponse.data);

        if (categoryId) {
          const categoryResponse = await api.get(`/categories/${categoryId}`);
          setCategoryName(categoryResponse.data.name);
        } else {
          setCategoryName('');
        }
      } catch (error) {
        console.error('Ошибка загрузки данных:', error);
        setError('Не удалось загрузить данные');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [categoryId]);
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

  if (!products.length) {
    return (
      <Container maxWidth="lg" style={{ padding: 20 }}>
        <Typography variant="h5">Товары не найдены</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" style={{ padding: 20 }}>
      <Typography variant="h4" gutterBottom>
        {categoryName ? `${categoryName}` : 'Каталог товаров'}
      </Typography>

      <Grid container spacing={3}>
        {products.map((product) => (
          <Grid item xs={12} sm={6} md={4} key={product.id}>
            <ProductCard product={product} />
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default ProductsPage;