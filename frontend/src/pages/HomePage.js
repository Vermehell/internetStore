import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Container,
  Typography,
  Button,
  Grid,
  Paper,
  Card,
  CardContent,
  CardMedia,
  Box,
  CircularProgress
} from '@mui/material';
import api from '../api';
import ProductCard from '../components/ProductCard';

const HomePage = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productsRes, categoriesRes] = await Promise.all([
          api.get('/products?limit=4'),
          api.get('/categories')
        ]);
        setFeaturedProducts(productsRes.data);
        setCategories(categoriesRes.data.map(cat => ({
          ...cat,
          image_url: cat.image_url || process.env.PUBLIC_URL + '/images/categories/default.jpg'
        })));
      } catch (err) {
        setError('Не удалось загрузить данные');
        console.error('Ошибка загрузки:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 8, textAlign: 'center' }}>
        <CircularProgress size={60} />
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 8, textAlign: 'center' }}>
        <Typography color="error" variant="h5">
          {error}
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      {/* Герой-секция */}
      <Box
        sx={{
          textAlign: 'center',
          py: 8,
          mb: 6,
          background: theme => theme.palette.background.paper,
          borderRadius: 2,
          boxShadow: 1
        }}
      >
        <Typography
          variant="h2"
          component="h1"
          gutterBottom
          sx={{
            fontWeight: 700,
            fontSize: { xs: '2.5rem', md: '3.5rem' }
          }}
        >
          Магазин электроники TechStore
        </Typography>
        <Typography
          variant="h5"
          sx={{
            mb: 4,
            color: 'text.secondary',
            fontSize: { xs: '1.1rem', md: '1.25rem' }
          }}
        >
          Лучшие гаджеты и комплектующие по выгодным ценам
        </Typography>
        <Button
          variant="contained"
          size="large"
          component={Link}
          to="/products"
          sx={{
            px: 6,
            py: 1.5,
            fontSize: '1.1rem',
            '&:hover': { transform: 'scale(1.05)' }
          }}
        >
          Перейти к покупкам
        </Button>
      </Box>

      {/* Популярные товары */}
      <Typography
        variant="h4"
        component="h2"
        sx={{
          mb: 4,
          fontWeight: 600,
          fontSize: { xs: '1.8rem', md: '2.125rem' }
        }}
      >
        Популярные товары
      </Typography>
      <Grid container spacing={4} sx={{ mb: 8 }}>
        {featuredProducts.map((product) => (
          <Grid item xs={12} sm={6} md={3} key={product.id}>
            <ProductCard product={product} />
          </Grid>
        ))}
      </Grid>

      {/* Категории с исправленным отображением изображений */}
      <Typography
        variant="h4"
        component="h2"
        sx={{
          mb: 4,
          fontWeight: 600,
          fontSize: { xs: '1.8rem', md: '2.125rem' }
        }}
      >
        Категории
      </Typography>
      <Grid container spacing={4} sx={{ mb: 8 }}>
        {categories.map((category) => (
          <Grid item xs={12} md={4} key={category.id}>
            <Card
              component={Link}
              to={`/products?category=${category.id}`} // Исправленный URL
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
                textDecoration: 'none',
                transition: 'transform 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-5px)',
                  boxShadow: 3
                }
              }}
            >
              <Box
                sx={{
                  position: 'relative',
                  paddingTop: '56.25%', // 16:9 aspect ratio
                  height: 0
                }}
              >
                <CardMedia
                  component="img"
                  sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    transition: 'transform 0.3s',
                    '&:hover': {
                      transform: 'scale(1.05)'
                    }
                  }}
                  image={process.env.PUBLIC_URL + category.image_url}
                  alt={category.name}
                />
              </Box>
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography variant="h5" component="h3" align="center">
                  {category.name}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Преимущества */}
      <Paper
        elevation={0}
        sx={{
          p: 4,
          mb: 8,
          background: theme => theme.palette.background.paper,
          borderRadius: 2
        }}
      >
        <Typography
          variant="h4"
          component="h2"
          sx={{
            mb: 6,
            fontWeight: 600,
            textAlign: 'center',
            fontSize: { xs: '1.8rem', md: '2.125rem' }
          }}
        >
          Наши преимущества
        </Typography>
        <Grid container spacing={4}>
          {[
            {
              title: '🚚 Быстрая доставка',
              text: 'Курьерская доставка по городу за 2 часа'
            },
            {
              title: '🔒 Гарантия качества',
              text: 'Все товары проходят многоэтапную проверку'
            },
            {
              title: '🛡️ Защита покупателей',
              text: 'Возврат и обмен товара в течение 14 дней'
            },
          ].map((benefit, index) => (
            <Grid item xs={12} md={4} key={index}>
              <Box sx={{
                textAlign: 'center',
                p: 3,
                height: '100%',
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 2
              }}>
                <Typography
                  variant="h5"
                  gutterBottom
                  sx={{
                    fontWeight: 600,
                    color: 'primary.main'
                  }}
                >
                  {benefit.title}
                </Typography>
                <Typography
                  color="text.secondary"
                  sx={{ fontSize: '1.1rem' }}
                >
                  {benefit.text}
                </Typography>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Paper>
    </Container>
  );
};

export default HomePage;