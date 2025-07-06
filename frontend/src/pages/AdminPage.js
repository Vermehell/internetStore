import React, { useEffect, useState } from 'react';
import api, { updateProductWithSpecs } from '../api';
import { Container, Typography, CircularProgress, Alert, Button, Grid, Box, Dialog, DialogTitle, DialogContent, DialogActions, TextField } from '@mui/material';
import AdminProductCard from '../components/AdminProductCard';
import { useAuth } from '../contexts/AuthContext';

const AdminPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editProduct, setEditProduct] = useState(null);
  const [deleteProductId, setDeleteProductId] = useState(null);
  const [form, setForm] = useState({ name: '', description: '', price: '', image_url: '', category_id: '', stock: '' });
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState([]);
  const [createOpen, setCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState({ name: '', description: '', price: '', image_url: '', category_id: '', stock: '' });
  const [creating, setCreating] = useState(false);
  const [createSpecs, setCreateSpecs] = useState([{ spec_name: '', spec_value: '' }]);
  const [editSpecs, setEditSpecs] = useState([]);
  const { user } = useAuth();

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await api.get('/products');
      setProducts(res.data);
    } catch (e) {
      setError('Ошибка загрузки товаров');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await api.get('/categories');
      setCategories(res.data);
    } catch (e) {
      setCategories([]);
    }
  };

  useEffect(() => { fetchProducts(); fetchCategories(); }, []);

  const handleEdit = async (product) => {
    setEditProduct(product);
    setEditSpecs([]);
    setForm({
      name: product.name,
      description: product.description,
      price: product.price,
      image_url: product.image_url,
      category_id: product.category_id,
      stock: product.stock,
    });
    try {
      const res = await api.get(`/products/${product.id}/specs`);
      setEditSpecs(res.data.length ? res.data.map(s => ({ id: s.id, spec_name: s.spec_name, spec_value: s.spec_value })) : [{ spec_name: '', spec_value: '' }]);
    } catch {
      setEditSpecs([{ spec_name: '', spec_value: '' }]);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Удалить товар?')) return;
    try {
      await api.delete(`/products/${id}`);
      setProducts(products.filter(p => p.id !== id));
    } catch (e) {
      setError('Ошибка удаления товара');
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateProductWithSpecs(editProduct.id, {
        ...form,
        price: parseFloat(form.price),
        stock: parseInt(form.stock, 10),
        category_id: parseInt(form.category_id, 10),
        specs: editSpecs.filter(s => s.spec_name && s.spec_value).map((s, idx) => ({ ...s, order: idx }))
      });
      setEditProduct(null);
      setEditSpecs([]);
      fetchProducts();
    } catch (e) {
      setError('Ошибка сохранения товара');
      console.error('Ошибка сохранения товара:', e);
    } finally {
      setSaving(false);
    }
  };

  const handleCreateSpecChange = (idx, field, value) => {
    setCreateSpecs(specs => specs.map((s, i) => i === idx ? { ...s, [field]: value } : s));
  };

  const handleAddSpec = () => setCreateSpecs(specs => [...specs, { spec_name: '', spec_value: '' }]);

  const handleRemoveSpec = (idx) => setCreateSpecs(specs => specs.filter((_, i) => i !== idx));

  const handleCreate = async () => {
    setCreating(true);
    try {
      await api.post('/products/with-specs', {
        ...createForm,
        price: parseFloat(createForm.price),
        stock: parseInt(createForm.stock, 10),
        category_id: parseInt(createForm.category_id, 10),
        specs: createSpecs.filter(s => s.spec_name && s.spec_value)
      });
      setCreateOpen(false);
      setCreateForm({ name: '', description: '', price: '', image_url: '', category_id: '', stock: '' });
      setCreateSpecs([{ spec_name: '', spec_value: '' }]);
      fetchProducts();
    } catch (e) {
      setError('Ошибка создания товара');
    } finally {
      setCreating(false);
    }
  };

  const handleEditSpecChange = (idx, field, value) => {
    setEditSpecs(specs => specs.map((s, i) => i === idx ? { ...s, [field]: value } : s));
  };

  const handleAddEditSpec = () => setEditSpecs(specs => [...specs, { spec_name: '', spec_value: '' }]);

  const handleRemoveEditSpec = (idx) => setEditSpecs(specs => specs.filter((_, i) => i !== idx));

  if (!user || !user.is_admin) return <Container><Alert severity="error">Доступ запрещён</Alert></Container>;
  if (loading) return <Container><CircularProgress /></Container>;
  if (error) return <Container><Alert severity="error">{error}</Alert></Container>;

  return (
    <Container maxWidth="lg" style={{ padding: 20 }}>
      <Typography variant="h4" gutterBottom>Управление товарами</Typography>
      <Grid container spacing={2}>
        {products.map(product => (
          <Grid item xs={12} md={6} lg={4} key={product.id}>
            <AdminProductCard
              product={product}
              onEdit={() => handleEdit(product)}
              onDelete={() => handleDelete(product.id)}
            />
          </Grid>
        ))}
      </Grid>
      <Box mt={3}>
        <Button variant="contained" color="primary" sx={{ mb: 2 }} onClick={() => setCreateOpen(true)}>
          Добавить товар
        </Button>
      </Box>
      <Dialog open={!!editProduct} onClose={() => { setEditProduct(null); setEditSpecs([]); }}>
        <DialogTitle>Редактировать товар</DialogTitle>
        <DialogContent>
          <TextField label="Название" fullWidth margin="normal" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
          <TextField label="Описание" fullWidth margin="normal" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
          <TextField label="Цена" type="number" fullWidth margin="normal" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} />
          <TextField label="URL изображения" fullWidth margin="normal" value={form.image_url} onChange={e => setForm({ ...form, image_url: e.target.value })} />
          <TextField label="ID категории" type="number" fullWidth margin="normal" value={form.category_id} onChange={e => setForm({ ...form, category_id: e.target.value })} />
          <TextField label="В наличии (шт.)" type="number" fullWidth margin="normal" value={form.stock} onChange={e => setForm({ ...form, stock: e.target.value })} />
          <Box mt={2}>
            <Typography variant="subtitle1">Характеристики</Typography>
            {editSpecs.map((spec, idx) => (
              <Box key={idx} display="flex" gap={1} alignItems="center" mb={1}>
                <TextField label="Название" value={spec.spec_name} onChange={e => handleEditSpecChange(idx, 'spec_name', e.target.value)} size="small" />
                <TextField label="Значение" value={spec.spec_value} onChange={e => handleEditSpecChange(idx, 'spec_value', e.target.value)} size="small" />
                <Button onClick={() => handleRemoveEditSpec(idx)} color="error" size="small" disabled={editSpecs.length === 1}>Удалить</Button>
              </Box>
            ))}
            <Button onClick={handleAddEditSpec} size="small">Добавить характеристику</Button>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { setEditProduct(null); setEditSpecs([]); }} color="secondary">Отмена</Button>
          <Button onClick={handleSave} color="primary" disabled={saving}>{saving ? 'Сохранение...' : 'Сохранить'}</Button>
        </DialogActions>
      </Dialog>
      <Dialog open={createOpen} onClose={() => setCreateOpen(false)}>
        <DialogTitle>Добавить товар</DialogTitle>
        <DialogContent>
          <TextField label="Название" fullWidth margin="normal" value={createForm.name} onChange={e => setCreateForm({ ...createForm, name: e.target.value })} />
          <TextField label="Описание" fullWidth margin="normal" value={createForm.description} onChange={e => setCreateForm({ ...createForm, description: e.target.value })} />
          <TextField label="Цена" type="number" fullWidth margin="normal" value={createForm.price} onChange={e => setCreateForm({ ...createForm, price: e.target.value })} />
          <TextField label="URL изображения" fullWidth margin="normal" value={createForm.image_url} onChange={e => setCreateForm({ ...createForm, image_url: e.target.value })} />
          <TextField label="В наличии (шт.)" type="number" fullWidth margin="normal" value={createForm.stock} onChange={e => setCreateForm({ ...createForm, stock: e.target.value })} />
          <TextField select label="Категория" fullWidth margin="normal" value={createForm.category_id} onChange={e => setCreateForm({ ...createForm, category_id: e.target.value })} SelectProps={{ native: true }}>
            <option value="">Выберите категорию</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </TextField>
          <Box mt={2}>
            <Typography variant="subtitle1">Характеристики</Typography>
            {createSpecs.map((spec, idx) => (
              <Box key={idx} display="flex" gap={1} alignItems="center" mb={1}>
                <TextField label="Название" value={spec.spec_name} onChange={e => handleCreateSpecChange(idx, 'spec_name', e.target.value)} size="small" />
                <TextField label="Значение" value={spec.spec_value} onChange={e => handleCreateSpecChange(idx, 'spec_value', e.target.value)} size="small" />
                <Button onClick={() => handleRemoveSpec(idx)} color="error" size="small" disabled={createSpecs.length === 1}>Удалить</Button>
              </Box>
            ))}
            <Button onClick={handleAddSpec} size="small">Добавить характеристику</Button>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateOpen(false)} color="secondary">Отмена</Button>
          <Button onClick={handleCreate} color="primary" disabled={creating}>{creating ? 'Создание...' : 'Создать'}</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default AdminPage;