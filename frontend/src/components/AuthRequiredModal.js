import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from '@mui/material';

const AuthRequiredModal = ({ open, onClose, onLoginClick, onRegisterClick }) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Требуется авторизация</DialogTitle>
      <DialogContent>
        Чтобы добавить товар в корзину, войдите или зарегистрируйтесь.
      </DialogContent>
      <DialogActions>
        <Button onClick={onLoginClick} color="primary">
          Войти
        </Button>
        <Button onClick={onRegisterClick} color="primary" variant="contained">
          Зарегистрироваться
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AuthRequiredModal;