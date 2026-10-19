// HOOK DEL FORMULARIO "Nueva tarea".
// Guarda lo que el usuario va escribiendo y decide si se puede enviar.
// Así el componente del formulario solo se encarga de mostrarse.
import { useState } from 'react';
import { isValidTitle } from '../rules/taskRules.js';

export function useTaskForm(onSubmit) {
  const [title, setTitle] = useState('');

  const handleChange = (event) => setTitle(event.target.value);

  const handleSubmit = (event) => {
    event.preventDefault(); // evita que el navegador recargue la página
    if (!isValidTitle(title)) return;
    onSubmit(title);
    setTitle(''); // limpia el campo después de crear la tarea
  };

  return {
    title,
    canSubmit: isValidTitle(title),
    handleChange,
    handleSubmit,
  };
}
