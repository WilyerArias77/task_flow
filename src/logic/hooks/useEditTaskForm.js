// HOOK DEL FORMULARIO "Editar tarea".
// Arranca con una copia de los datos de la tarea (incluida la repetición). El usuario los modifica
// y, al guardar, se sobrescribe la tarea original con los nuevos valores.
import { useState } from 'react';
import { isValidTitle } from '../rules/taskRules.js';

export function useEditTaskForm(task, onSave) {
  const [draft, setDraft] = useState({
    title: task.title,
    description: task.description,
    dueDate: task.dueDate,
    frequency: task.frequency,
    recurring: task.recurring,
  });

  const setField = (field) => (event) =>
    setDraft((current) => ({ ...current, [field]: event.target.value }));

  const handleRecurringChange = (event) =>
    setDraft((current) => ({ ...current, recurring: event.target.checked }));

  const handleDueDateChange = (dueDate) =>
    setDraft((current) => ({ ...current, dueDate }));

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!isValidTitle(draft.title)) return;
    onSave(draft);
  };

  return {
    draft,
    canSave: isValidTitle(draft.title),
    handleTitleChange: setField('title'),
    handleDescriptionChange: setField('description'),
    handleFrequencyChange: setField('frequency'),
    handleRecurringChange,
    handleDueDateChange,
    handleSubmit,
  };
}
