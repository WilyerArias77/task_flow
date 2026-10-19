// FORMULARIO para crear una tarea nueva (título y fecha opcional).
// Solo muestra los campos y el botón. Qué se escribe y si es válido
// lo decide el hook useTaskForm (carpeta logic).
import { useTaskForm } from '../logic/hooks/useTaskForm.js';
import DateField from './DateField.jsx';

export default function TaskForm({ onAddTask }) {
  const form = useTaskForm(onAddTask);

  return (
    <form className="task-form" onSubmit={form.handleSubmit}>
      <input
        className="task-form__input"
        type="text"
        placeholder="Escribe una nueva tarea…"
        value={form.title}
        onChange={form.handleTitleChange}
        aria-label="Título de la nueva tarea"
      />
      <DateField
        value={form.dueDate}
        onChange={form.handleDueDateChange}
        label="Fecha de la nueva tarea"
      />
      <button className="button" type="submit" disabled={!form.canSubmit}>
        Agregar
      </button>
    </form>
  );
}
