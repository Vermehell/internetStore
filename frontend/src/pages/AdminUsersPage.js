import React, { useEffect, useState } from 'react';
import api from '../api';
import {
  Container, Typography, Box, TextField, List, ListItem, ListItemText, IconButton, Alert, Button, ListItemSecondaryAction
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import PersonIcon from '@mui/icons-material/Person';
import { useAuth } from '../contexts/AuthContext';

const AdminUsersPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [saving, setSaving] = useState(false);
  const { logout } = useAuth();

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await api.get('/users');
      setUsers(res.data);
    } catch (e) {
      setError('Ошибка загрузки пользователей');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleToggleAdmin = async (user) => {
    setSaving(true);
    try {
      await api.put(`/users/${user.id}/role`, { is_admin: !user.is_admin });
      fetchUsers();
    } catch (e) {
      const detail = e.response?.data?.detail;
      setError(detail || 'Ошибка изменения роли');
      if (
        detail?.includes('Нельзя снять роль админа с самого себя') ||
        e.response?.status === 403
      ) {
        setTimeout(() => {
          logout();
          window.location.href = '/';
        }, 1500);
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Удалить пользователя?')) return;
    try {
      await api.delete(`/users/${id}`);
      fetchUsers();
    } catch (e) {
      setError(e.response?.data?.detail || 'Ошибка удаления пользователя');
    }
  };

  const filteredUsers = users.filter(u =>
    u.login.toLowerCase().includes(search.toLowerCase()) ||
    u.username.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Container maxWidth="sm" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>Управление пользователями</Typography>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      <Box mb={2}>
        <TextField
          label="Поиск по логину, имени или email"
          fullWidth
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </Box>
      <List>
        {filteredUsers.map(user => (
          <ListItem key={user.id}>
            <ListItemText
              primary={user.username + (user.is_admin ? ' (админ)' : '')}
              secondary={user.email + ' | ' + user.login}
            />
            <ListItemSecondaryAction>
              <IconButton edge="end" aria-label="role" onClick={() => handleToggleAdmin(user)} disabled={saving}>
                {user.is_admin ? <AdminPanelSettingsIcon color="primary" /> : <PersonIcon />}
              </IconButton>
              <IconButton edge="end" aria-label="delete" onClick={() => handleDelete(user.id)} disabled={saving}>
                <DeleteIcon color="error" />
              </IconButton>
            </ListItemSecondaryAction>
          </ListItem>
        ))}
      </List>
    </Container>
  );
};

export default AdminUsersPage; 