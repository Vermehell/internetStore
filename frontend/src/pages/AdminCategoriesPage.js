import React, { useEffect, useState } from 'react';
import api from '../api';
import {
  Container, Typography, Box, Button, TextField, Dialog, DialogTitle, DialogContent, DialogActions, List, ListItem, ListItemText, IconButton, Alert
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import Tooltip from '@mui/material/Tooltip';

const AdminCategoriesPage = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [form, setForm] = useState({ name: '', image_url: '' });
  const [editId, setEditId] = useState(null);
  const [saving, setSaving] = useState(false);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await api.get('/categories');
      setCategories(res.data);
    } catch (e) {
      setError('Ошибка загрузки категорий');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCategories(); }, []);

  const handleCreate = async () => {
    setSaving(true);
    try {
      await api.post('/categories', form);
      setCreateOpen(false);
      setForm({ name: '', image_url: '' });
      fetchCategories();
    } catch (e) {
      setError('Ошибка создания категории');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (cat) => {
    setEditId(cat.id);
    setForm({ name: cat.name, image_url: cat.image_url });
    setEditOpen(true);
  };

  const handleUpdate = async () => {
    setSaving(true);
    try {
      await api.put(`/categories/${editId}`, form);
      setEditOpen(false);
      setEditId(null);
      setForm({ name: '', image_url: '' });
      fetchCategories();
    } catch (e) {
      setError('Ошибка обновления категории');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Удалить категорию?')) return;
    try {
      await api.delete(`/categories/${id}`);
      fetchCategories();
    } catch (e) {
      setError('Ошибка удаления категории');
    }
  };

  return (
    <Container maxWidth="sm" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>Управление категориями</Typography>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      <Box mb={2}>
        <Button variant="contained" color="primary" onClick={() => setCreateOpen(true)}>
          Добавить категорию
        </Button>
      </Box>
      <List>
        {categories.map(cat => (
          <ListItem key={cat.id} secondaryAction={
            <>
              <IconButton edge="end" aria-label="edit" onClick={() => handleEdit(cat)}><EditIcon /></IconButton>
              <IconButton edge="end" aria-label="delete" onClick={() => handleDelete(cat.id)}><DeleteIcon color="error" /></IconButton>
            </>
          }>
            <ListItemText
              primary={cat.name}
              secondary={
                <Tooltip title={cat.image_url}>
                  <span style={{ display: 'inline-block', maxWidth: 320, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', verticalAlign: 'bottom' }}>
                    {cat.image_url}
                  </span>
                </Tooltip>
              }
            />
          </ListItem>
        ))}
      </List>
      {/* Диалог создания */}
      <Dialog open={createOpen} onClose={() => setCreateOpen(false)}>
        <DialogTitle>Добавить категорию</DialogTitle>
        <DialogContent>
          <TextField label="Название" fullWidth margin="normal" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
          <TextField label="URL изображения" fullWidth margin="normal" value={form.image_url} onChange={e => setForm({ ...form, image_url: e.target.value })} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateOpen(false)} color="secondary">Отмена</Button>
          <Button onClick={handleCreate} color="primary" disabled={saving}>{saving ? 'Создание...' : 'Создать'}</Button>
        </DialogActions>
      </Dialog>
      {/* Диалог редактирования */}
      <Dialog open={editOpen} onClose={() => setEditOpen(false)}>
        <DialogTitle>Редактировать категорию</DialogTitle>
        <DialogContent>
          <TextField label="Название" fullWidth margin="normal" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
          <TextField label="URL изображения" fullWidth margin="normal" value={form.image_url} onChange={e => setForm({ ...form, image_url: e.target.value })} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditOpen(false)} color="secondary">Отмена</Button>
          <Button onClick={handleUpdate} color="primary" disabled={saving}>{saving ? 'Сохранение...' : 'Сохранить'}</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default AdminCategoriesPage; 