import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Menu, MenuItem, ListItemIcon, ListItemText } from '@mui/material';
import Inventory2Icon from '@mui/icons-material/Inventory2';
import CategoryIcon from '@mui/icons-material/Category';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import PeopleIcon from '@mui/icons-material/People';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';

const AdminMenu = () => {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const navigate = useNavigate();

  const handleOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };
  const handleNavigate = (path) => {
    navigate(path);
    handleClose();
  };

  return (
    <>
      <Button
        color="inherit"
        startIcon={<AdminPanelSettingsIcon />}
        onClick={handleOpen}
        sx={{ ml: 2 }}
      >
        Админ
      </Button>
      <Menu anchorEl={anchorEl} open={open} onClose={handleClose}>
        <MenuItem onClick={() => handleNavigate('/admin/products')}>
          <ListItemIcon><Inventory2Icon fontSize="small" /></ListItemIcon>
          <ListItemText primary="Товары" />
        </MenuItem>
        <MenuItem onClick={() => handleNavigate('/admin/categories')}>
          <ListItemIcon><CategoryIcon fontSize="small" /></ListItemIcon>
          <ListItemText primary="Категории" />
        </MenuItem>
        <MenuItem onClick={() => handleNavigate('/admin/orders')}>
          <ListItemIcon><ShoppingBagIcon fontSize="small" /></ListItemIcon>
          <ListItemText primary="Заказы" />
        </MenuItem>
        <MenuItem onClick={() => handleNavigate('/admin/users')}>
          <ListItemIcon><PeopleIcon fontSize="small" /></ListItemIcon>
          <ListItemText primary="Пользователи" />
        </MenuItem>
      </Menu>
    </>
  );
};

export default AdminMenu; 