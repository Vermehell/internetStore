import React from 'react';
import { Card, CardMedia, CardContent, CardActions, Typography, Button, Box } from '@mui/material';

const AdminProductCard = ({ product, onEdit, onDelete }) => {
  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', boxShadow: 3 }}>
      <CardMedia
        component="img"
        height="160"
        image={product.image_url || '/images/products/placeholder.jpg'}
        alt={product.name}
        sx={{ objectFit: 'contain', background: '#f5f5f5', p: 1 }}
      />
      <CardContent sx={{ flexGrow: 1 }}>
        <Typography variant="h6" gutterBottom noWrap>{product.name}</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1, minHeight: 40, maxHeight: 40, overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {product.description}
        </Typography>
        <Typography variant="subtitle1" color="primary.main" sx={{ fontWeight: 600 }}>{product.price} ₽</Typography>
        <Typography variant="body2" color="text.secondary">Категория: {product.category_id}</Typography>
        <Typography variant="body2" color={product.stock > 0 ? 'success.main' : 'error.main'}>
          В наличии: {product.stock}
        </Typography>
      </CardContent>
      <CardActions sx={{ justifyContent: 'flex-end', p: 2 }}>
        <Button variant="outlined" color="primary" size="small" onClick={onEdit} sx={{ mr: 1 }}>Редактировать</Button>
        <Button variant="outlined" color="error" size="small" onClick={onDelete}>Удалить</Button>
      </CardActions>
    </Card>
  );
};

export default AdminProductCard; 