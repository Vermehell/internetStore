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
} from '@mui/material';
import api from '../api';

const ProductDetailPage = () => {
  const { productId } = useParams();
  const [product, setProduct] = useState(null);
  const [specs, setSpecs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
              <TableContainer component={Paper}>
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
          </CardContent>
        </Grid>
      </Grid>
    </Container>
  );
};

export default ProductDetailPage;