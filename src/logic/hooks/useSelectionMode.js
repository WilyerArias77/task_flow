// HOOK DE MODOS DE SELECCIÓN ("Editar" y "Eliminar").
// La app tiene tres modos:
//   - 'normal': se usan las tareas como siempre (marcar, arrastrar, fecha).
//   - 'delete': se hace clic en las tareas para seleccionarlas y eliminarlas.
//   - 'edit':   se hace clic en una tarea para abrirla y sobrescribirla.
// Este hook recuerda el modo actual y qué tareas están seleccionadas.
import { useState } from 'react';

export function useSelectionMode({ onDelete, onUpdate }) {
  const [mode, setMode] = useState('normal');
  const [selectedIds, setSelectedIds] = useState([]);
  const [editingId, setEditingId] = useState(null);

  const reset = () => {
    setMode('normal');
    setSelectedIds([]);
    setEditingId(null);
  };

  const start = (newMode) => {
    setMode(newMode);
    setSelectedIds([]);
    setEditingId(null);
  };

  // Clic sobre una tarea según el modo
  const select = (taskId) => {
    if (mode === 'delete') {
      setSelectedIds((current) =>
        current.includes(taskId)
          ? current.filter((id) => id !== taskId)
          : [...current, taskId]
      );
    }
    if (mode === 'edit') setEditingId(taskId);
  };

  const confirmDelete = () => {
    if (selectedIds.length === 0) return;
    onDelete(selectedIds);
    reset();
  };

  const saveEdit = (changes) => {
    onUpdate(editingId, changes);
    reset();
  };

  // Props para que una tarjeta se pueda elegir con clic o con teclado (Enter/Espacio)
  const getSelectableProps = (taskId) => ({
    role: 'button',
    tabIndex: 0,
    'aria-pressed': selectedIds.includes(taskId),
    onClick: () => select(taskId),
    onKeyDown: (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        select(taskId);
      }
    },
  });

  return {
    mode,
    selectedCount: selectedIds.length,
    editingId,
    isSelected: (taskId) => selectedIds.includes(taskId),
    startDelete: () => start('delete'),
    startEdit: () => start('edit'),
    cancel: reset,
    stopEditing: () => setEditingId(null),
    confirmDelete,
    saveEdit,
    getSelectableProps,
  };
}
