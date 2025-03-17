import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom'; // Для работы с параметрами URL
import { useAuth } from '../contexts/AuthContext'; // Для работы с авторизацией
import api from '../api/index'; // API для запросов к бекенду
import ProductCard from '../components/ProductCard'; // Компонент карточки товара
import { Grid, Container, Typography, CircularProgress, Alert } from '@mui/material'; // Компоненты Material-UI

const ProductsPage = () => {
  const [products, setProducts] = useState([]); // Состояние для списка товаров
  const [loading, setLoading] = useState(true); // Состояние для загрузки
  const [categoryName, setCategoryName] = useState(''); // Состояние для названия категории
  const [error, setError] = useState(null); // Состояние для ошибок
  const [searchParams] = useSearchParams(); // Получаем параметры из URL
  const categoryId = searchParams.get('category'); // Извлекаем ID категории

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Загружаем товары
        const productsUrl = categoryId 
          ? `/products?category_id=${categoryId}` // Если есть категория, фильтруем товары
          : '/products'; // Иначе загружаем все товары
        const productsResponse = await api.get(productsUrl);
        setProducts(productsResponse.data);

        // Если есть categoryId, загружаем название категории
        if (categoryId) {
          const categoryResponse = await api.get(`/categories/${categoryId}`);
          setCategoryName(categoryResponse.data.name);
        } else {
          setCategoryName(''); // Сбрасываем название, если категория не выбрана
        }
      } catch (error) {
        console.error('Ошибка загрузки данных:', error);
        setError('Не удалось загрузить данные'); // Устанавливаем сообщение об ошибке
      } finally {
        setLoading(false); // Завершаем загрузку
      }
    };

    fetchData(); // Вызываем функцию загрузки данных
  }, [categoryId]); // Зависимость от categoryId

  // Если идет загрузка, показываем индикатор
  if (loading) {
    return (
      <Container maxWidth="lg" style={{ padding: 20, textAlign: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  // Если произошла ошибка, показываем сообщение
  if (error) {
    return (
      <Container maxWidth="lg" style={{ padding: 20 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  // Если товаров нет, показываем сообщение
  if (!products.length) {
    return (
      <Container maxWidth="lg" style={{ padding: 20 }}>
        <Typography variant="h5">Товары не найдены</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" style={{ padding: 20 }}>
      {/* Заголовок страницы */}
      <Typography variant="h4" gutterBottom>
        {categoryName ? `${categoryName}` : 'Каталог товаров'}
      </Typography>

      {/* Сетка товаров */}
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