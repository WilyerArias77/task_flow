// FORMULARIO DE EDICIÓN de una tarea.
// Aparece dentro de la tarjeta elegida en el modo "Editar".
// Permite sobrescribir título, descripción, fecha, lista (diaria/mensual/anual)
// y si la tarea se repite automáticamente.
// Los datos en edición y la validación viven en useEditTaskForm.
import { useEditTaskForm } from '../logic/hooks/useEditTaskForm.js';
import DateField from './DateField.jsx';

export default function TaskEditForm({ task, frequencies, onSave, onCancel }) {
  const form = useEditTaskForm(task, onSave);

  return (
    <form className="edit-form" onSubmit={form.handleSubmit}>
      <label className="edit-form__field">
        <span className="edit-form__label">Título</span>
        <input
          className="edit-form__input"
          type="text"
          value={form.draft.title}
          onChange={form.handleTitleChange}
          autoFocus
        />
      </label>

      <label className="edit-form__field">
        <span className="edit-form__label">Descripción</span>
        <input
          className="edit-form__input"
          type="text"
          value={form.draft.description}
          onChange={form.handleDescriptionChange}
        />
      </label>

      <div className="edit-form__row">
        <div className="edit-form__field">
          <span className="edit-form__label">Fecha</span>
          <DateField
            value={form.draft.dueDate}
            onChange={form.handleDueDateChange}
            label="Fecha de la tarea"
          />
        </div>

        <label className="edit-form__field">
          <span className="edit-form__label">Lista</span>
          <select
            className="edit-form__input"
            value={form.draft.frequency}
            onChange={form.handleFrequencyChange}
          >
            {frequencies.map((frequency) => (
              <option key={frequency.id} value={frequency.id}>
                {frequency.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <label className="edit-form__check">
        <input
          type="checkbox"
          checked={form.draft.recurring}
          onChange={form.handleRecurringChange}
        />
        <span>
          Repetir automáticamente{' '}
          {frequencies.find((f) => f.id === form.draft.frequency)?.everyLabel}
        </span>
      </label>

      <div className="edit-form__actions">
        <button className="button button--secondary" type="button" onClick={onCancel}>
          Cancelar
        </button>
        <button className="button" type="submit" disabled={!form.canSave}>
          Guardar cambios
        </button>
      </div>
    </form>
  );
}
