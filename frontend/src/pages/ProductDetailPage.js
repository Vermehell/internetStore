import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Container, Typography, Grid, Card, CardMedia, CardContent, CircularProgress, Paper, Table, TableBody, TableCell, TableContainer, TableRow } from '@mui/material';
import api from '../api';

const ProductDetailPage = () => {
    const { productId } = useParams();
    const [product, setProduct] = useState(null);
    const [specs, setSpecs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                // Запрос данных о товаре
                const productResponse = await api.get(`/products/${productId}`);
                // Запрос характеристик товара
                const specsResponse = await api.get(`/products/${productId}/specs`);
                setProduct(productResponse.data);
                setSpecs(specsResponse.data);
            } catch (error) {
                console.error('Ошибка загрузки данных:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchProduct();
    }, [productId]);

    if (loading) return <CircularProgress />;
    if (!product) return <Typography>Товар не найден</Typography>;

    return (
        <Container maxWidth="lg" style={{ padding: 20 }}>
            <Grid container spacing={4}>
                {/* Изображение товара */}
                <Grid item xs={12} md={6}>
                    <Card>
                        <CardMedia
                            component="img"
                            height="500"
                            image={product.image_url || '/placeholder-product.jpg'}
                            alt={product.name}
                        />
                    </Card>
                </Grid>

                {/* Информация о товаре */}
                <Grid item xs={12} md={6}>
                    <CardContent>
                        <Typography variant="h3" gutterBottom>{product.name}</Typography>
                        <Typography variant="h5" color="textSecondary" paragraph>{product.description}</Typography>
                        <Typography variant="h4" style={{ margin: '20px 0' }}>{product.price} ₽</Typography>

                        {/* Характеристики */}
                        <Typography variant="h5" gutterBottom>Характеристики:</Typography>
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
                    </CardContent>
                </Grid>
            </Grid>
        </Container>
    );
};

export default ProductDetailPage;