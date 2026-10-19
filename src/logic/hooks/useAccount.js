// HOOK DE "MI CUENTA".
// Abre y cierra la ventana de la cuenta y maneja la eliminación:
// para evitar accidentes, el usuario debe escribir la palabra ELIMINAR.
import { useState } from 'react';
import * as authService from '../services/authService.js';

export const DELETE_CONFIRMATION_WORD = 'ELIMINAR';

export function useAccount() {
  const [isOpen, setIsOpen] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState(null);

  const open = () => setIsOpen(true);

  const close = () => {
    setIsOpen(false);
    setConfirmText('');
    setError(null);
  };

  const canDelete = confirmText.trim().toUpperCase() === DELETE_CONFIRMATION_WORD && !deleting;

  const deleteAccount = async () => {
    if (!canDelete) return;
    setDeleting(true);
    setError(null);
    try {
      // Al borrarse la cuenta se cierra la sesión y la app vuelve al login
      await authService.deleteMyAccount();
      close();
      setDeleting(false);
    } catch {
      setError('No se pudo eliminar la cuenta. Inténtalo de nuevo en unos minutos.');
      setDeleting(false);
    }
  };

  return {
    isOpen,
    open,
    close,
    confirmText,
    handleConfirmChange: (event) => setConfirmText(event.target.value),
    canDelete,
    deleting,
    error,
    deleteAccount,
  };
}
