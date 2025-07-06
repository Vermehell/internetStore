import React from 'react';
import { Link } from 'react-router-dom';
import { Card, Typography, Button, IconButton, Box } from '@mui/material';
import { Add, Remove } from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';

const ProductCard = ({ product }) => {
  const { user, setIsAuthRequiredModalOpen } = useAuth();
  const { cartItems, addToCart, incrementQuantity, decrementQuantity } = useCart();

  const cartItem = cartItems.find(item => item.product_id === product.id);
  const quantity = cartItem?.quantity || 0;

  const handleUpdateCart = async (newQuantity) => {
    if (!user) {
      setIsAuthRequiredModalOpen(true);
      return;
    }

    try {
      if (cartItem) {
        if (newQuantity > cartItem.quantity) {
          await incrementQuantity(product.id);
        } else if (newQuantity < cartItem.quantity) {
          await decrementQuantity(product.id);
        }
      } else {
        await addToCart(product.id, 1);
      }
    } catch (error) {
      console.error('Ошибка обновления корзины:', error);
    }
  };

  return (
    <Box
      component={Link}
      to={`/products/${product.id}`}
      sx={{ textDecoration: 'none', display: 'block', height: '100%' }}
    >
      <Card sx={{ height: '100%', minHeight: 420, maxHeight: 420, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        <Box sx={{
          width: '100%',
          height: 160,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          background: '#ececec',
          borderRadius: 2,
          boxShadow: 1,
          mb: 1,
          p: 1
        }}>
          <img
            src={product.image_url || '/images/products/placeholder.jpg'}
            alt={product.name}
            style={{
              maxWidth: '90%',
              maxHeight: '90%',
              minWidth: 80,
              minHeight: 80,
              objectFit: 'contain',
              borderRadius: 8,
              display: 'block',
              margin: '0 auto'
            }}
          />
        </Box>
        <Box p={2} sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'flex-start' }}>
          <Typography variant="h6" gutterBottom>{product.name}</Typography>
          <Box sx={{ position: 'relative' }}>
            <Typography
              variant="body2"
              color="textSecondary"
              paragraph
              sx={{
                fontSize: '1rem',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                display: '-webkit-box',
                WebkitLineClamp: 5,
                WebkitBoxOrient: 'vertical',
              }}
            >
              {product.description}
            </Typography>
          </Box>
          <Typography variant="h6">{product.price} ₽</Typography>
        </Box>
        {quantity > 0 ? (
          <Box display="flex" alignItems="center" justifyContent="space-between" p={1}>
            <IconButton
              onClick={(e) => { e.preventDefault(); handleUpdateCart(quantity - 1); }}
              size="small"
              color="primary"
            >
              <Remove />
            </IconButton>
            <Typography variant="h6">{quantity}</Typography>
            <IconButton
              onClick={(e) => { e.preventDefault(); handleUpdateCart(quantity + 1); }}
              size="small"
              color="primary"
            >
              <Add />
            </IconButton>
          </Box>
        ) : (
          <Button
            variant="contained"
            color="primary"
            fullWidth
            onClick={(e) => { e.preventDefault(); handleUpdateCart(1); }}
            sx={{ mt: 'auto' }}
          >
            В корзину
          </Button>
        )}
      </Card>
    </Box>
  );
};

export default ProductCard;