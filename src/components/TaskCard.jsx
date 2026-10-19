// TARJETA de una tarea.
// Muestra el título, la descripción y una casilla para marcarla como hecha.
// Es arrastrable gracias a "dragProps", que vienen ya preparadas desde la lógica.
export default function TaskCard({ task, isDragging, onToggle, dragProps }) {
  const classes = [
    'task-card',
    task.completed ? 'task-card--done' : '',
    isDragging ? 'task-card--dragging' : '',
  ].join(' ');

  return (
    <li className={classes} {...dragProps}>
      <input
        className="task-card__check"
        type="checkbox"
        checked={task.completed}
        onChange={() => onToggle(task.id)}
        aria-label={`Marcar "${task.title}" como completada`}
      />
      <div className="task-card__body">
        <p className="task-card__title">{task.title}</p>
        {task.description && (
          <p className="task-card__description">{task.description}</p>
        )}
      </div>
    </li>
  );
}
