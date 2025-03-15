import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardMedia, CardContent, Typography, Button, Box } from '@mui/material';
import { useAuth } from '../contexts/AuthContext';

const ProductCard = ({ product, onAddToCart }) => {
    const { user, setIsAuthRequiredModalOpen } = useAuth();

    const handleAddToCart = (e) => {
        e.preventDefault(); // Предотвращаем действие по умолчанию
        if (!user) {
            setIsAuthRequiredModalOpen(true);
        } else {
            onAddToCart();
        }
    };

    return (
        <Box 
            component={Link} 
            to={`/products/${product.id}`} 
            style={{ 
                textDecoration: 'none', 
                display: 'block', 
                height: '100%' 
            }}
        >
            <Card style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardMedia
                    component="img"
                    height="200"
                    image={product.image_url || '/placeholder-product.jpg'}
                    alt={product.name}
                />
                <CardContent style={{ flexGrow: 1 }}>
                    <Typography variant="h6" gutterBottom>{product.name}</Typography>
                    <Typography variant="body2" color="textSecondary" paragraph>
                        {product.description}
                    </Typography>
                    <Typography variant="h6" style={{ margin: '10px 0' }}>
                        {product.price} ₽
                    </Typography>
                </CardContent>
                <Button
                    variant="contained"
                    color="primary"
                    fullWidth
                    onClick={handleAddToCart}
                    style={{ marginTop: 'auto' }}
                >
                    В корзину
                </Button>
            </Card>
        </Box>
    );
};

export default ProductCard;