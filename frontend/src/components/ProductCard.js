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
      style={{ textDecoration: 'none', display: 'block', height: '100%' }}
    >
      <Card style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        <div className="product-card-image">
          <img
            src={product.image_url || '/images/products/placeholder.jpg'}
            alt={product.name}
            className="product-image"
          />
        </div>

        <Box p={2} style={{ flexGrow: 1 }}>
          <Typography variant="h6" gutterBottom>{product.name}</Typography>
          <Typography variant="body2" color="textSecondary" paragraph>
            {product.description}
          </Typography>
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
            style={{ marginTop: 'auto' }}
          >
            В корзину
          </Button>
        )}
      </Card>
    </Box>
  );
};

export default ProductCard;