import React from 'react';
import { Card, CardMedia, CardContent, Typography, Button } from '@mui/material';
import { useAuth } from '../contexts/AuthContext';

const ProductCard = ({ product, onAddToCart }) => {
  const { user, setIsAuthRequiredModalOpen } = useAuth(); // Получаем доступ к состоянию модального окна "Требуется авторизация"

  const handleAddToCart = () => {
    if (!user) {
      setIsAuthRequiredModalOpen(true); // Открываем модальное окно "Требуется авторизация"
    } else {
      onAddToCart(); // Если пользователь авторизован, добавляем товар в корзину
    }
  };

  return (
    <Card>
      <CardMedia
        component="img"
        height="200"
        image={product.image_url || '/placeholder-product.jpg'}
        alt={product.name}
      />
      <CardContent>
        <Typography variant="h6">{product.name}</Typography>
        <Typography variant="body2" color="textSecondary">
          {product.description}
        </Typography>
        <Typography variant="h6" style={{ margin: '10px 0' }}>
          {product.price} ₽
        </Typography>
        <Button
          variant="contained"
          color="primary"
          fullWidth
          onClick={handleAddToCart} // Используем новую функцию
        >
          В корзину
        </Button>
      </CardContent>
    </Card>
  );
};

export default ProductCard;