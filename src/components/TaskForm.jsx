// FORMULARIO para crear una tarea nueva.
// Solo muestra el campo y el botón. Qué se escribe y si es válido
// lo decide el hook useTaskForm (carpeta logic).
import { useTaskForm } from '../logic/hooks/useTaskForm.js';

export default function TaskForm({ onAddTask }) {
  const { title, canSubmit, handleChange, handleSubmit } = useTaskForm(onAddTask);

  return (
    <form className="task-form" onSubmit={handleSubmit}>
      <input
        className="task-form__input"
        type="text"
        placeholder="Escribe una nueva tarea…"
        value={title}
        onChange={handleChange}
        aria-label="Título de la nueva tarea"
      />
      <button className="button" type="submit" disabled={!canSubmit}>
        Agregar
      </button>
    </form>
  );
}
