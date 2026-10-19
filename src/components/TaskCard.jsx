// TARJETA de una tarea.
// Se ve distinta según el modo:
//   - normal:   agarradera para arrastrar, casilla de completada y campo de fecha.
//   - eliminar: se puede seleccionar con un clic (varias a la vez).
//   - editar:   se elige con un clic y se abre el formulario de edición.
// El ícono ↻ indica que la tarea se repite (cada día, mes o año).
// Los colores (rojo si está vencida, negro si está cumplida) los pone el CSS
// a partir de las clases; si está vencida o no lo decide la lógica (isOverdue).
import { isoToDisplay } from '../logic/rules/dateRules.js';
import DateField from './DateField.jsx';
import TaskEditForm from './TaskEditForm.jsx';

export default function TaskCard({
  task,
  columnId,
  frequencies,
  selection,
  dragAndDrop,
  onToggleTask,
  onDueDateChange,
}) {
  if (selection.editingId === task.id) {
    return (
      <li className="task-card task-card--editing">
        <TaskEditForm
          task={task}
          frequencies={frequencies}
          onSave={selection.saveEdit}
          onCancel={selection.stopEditing}
        />
      </li>
    );
  }

  const isNormal = selection.mode === 'normal';
  const repeatLabel = frequencies.find((f) => f.id === task.frequency)?.everyLabel;
  const classes = [
    'task-card',
    task.completed ? 'task-card--done' : '',
    task.isOverdue ? 'task-card--overdue' : '',
    dragAndDrop.draggingId === task.id ? 'task-card--dragging' : '',
    !isNormal ? `task-card--selectable task-card--${selection.mode}` : '',
    selection.isSelected(task.id) ? 'task-card--selected' : '',
  ].join(' ');

  const interactionProps = isNormal
    ? dragAndDrop.getCardDropProps(task.id, columnId)
    : selection.getSelectableProps(task.id);

  return (
    <li className={classes} {...interactionProps}>
      {isNormal ? (
        <>
          <span
            className="task-card__handle"
            title="Arrastrar"
            aria-hidden="true"
            {...dragAndDrop.getHandleProps(task.id)}
          >
            <svg viewBox="0 0 10 16" width="10" height="16">
              <circle cx="2" cy="2" r="1.5" /><circle cx="8" cy="2" r="1.5" />
              <circle cx="2" cy="8" r="1.5" /><circle cx="8" cy="8" r="1.5" />
              <circle cx="2" cy="14" r="1.5" /><circle cx="8" cy="14" r="1.5" />
            </svg>
          </span>
          <input
            className="task-card__check"
            type="checkbox"
            checked={task.completed}
            onChange={() => onToggleTask(task.id)}
            aria-label={`Marcar "${task.title}" como completada`}
          />
        </>
      ) : (
        <span className="task-card__marker" aria-hidden="true" />
      )}

      <div className="task-card__body">
        <p className="task-card__title">
          {task.recurring && (
            <span className="task-card__repeat" title={`Se repite ${repeatLabel}`} aria-label={`Se repite ${repeatLabel}`}>
              ↻
            </span>
          )}
          {task.title}
        </p>
        {task.description && (
          <p className="task-card__description">{task.description}</p>
        )}
      </div>

      <div className="task-card__date">
        {isNormal ? (
          <DateField
            value={task.dueDate}
            onChange={(dueDate) => onDueDateChange(task.id, dueDate)}
            label={`Fecha de "${task.title}"`}
          />
        ) : (
          <span className="task-card__date-text">
            {task.dueDate ? isoToDisplay(task.dueDate) : 'Sin fecha'}
          </span>
        )}
        {task.isOverdue && <span className="task-card__badge">Vencida</span>}
      </div>
    </li>
  );
}
