// HOOK DEL FORMULARIO "Nueva tarea".
// Guarda lo que el usuario va escribiendo (título y fecha) y decide si se
// puede enviar. Así el componente del formulario solo se encarga de mostrarse.
import { useState } from 'react';
import { isValidTitle } from '../rules/taskRules.js';

export function useTaskForm(onSubmit) {
  const [title, setTitle] = useState('');
  const [dueDate, setDueDate] = useState(null);

  const handleTitleChange = (event) => setTitle(event.target.value);

  const handleSubmit = (event) => {
    event.preventDefault(); // evita que el navegador recargue la página
    if (!isValidTitle(title)) return;
    onSubmit({ title, dueDate });
    setTitle(''); // limpia los campos después de crear la tarea
    setDueDate(null);
  };

  return {
    title,
    dueDate,
    canSubmit: isValidTitle(title),
    handleTitleChange,
    handleDueDateChange: setDueDate,
    handleSubmit,
  };
}
