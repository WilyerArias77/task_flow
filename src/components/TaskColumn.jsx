// COLUMNA del tablero ("Pendientes" o "Completadas").
// Pinta su título, el contador y sus tarjetas. En modo normal también es una
// zona donde se pueden soltar tarjetas: las props de arrastre vienen del hook.
import TaskCard from './TaskCard.jsx';

export default function TaskColumn({ column, ...cardProps }) {
  const { selection, dragAndDrop } = cardProps;
  const isNormal = selection.mode === 'normal';
  const isOver = isNormal && dragAndDrop.overColumnId === column.id;
  const dropProps = isNormal ? dragAndDrop.getColumnProps(column.id) : {};

  return (
    <div className={`column ${isOver ? 'column--over' : ''}`} {...dropProps}>
      <div className="column__header">
        <h3 className="column__title">{column.title}</h3>
        <span className="column__count">{column.tasks.length}</span>
      </div>

      <ul className="column__list">
        {column.tasks.map((task) => (
          <TaskCard key={task.id} task={task} columnId={column.id} {...cardProps} />
        ))}
      </ul>

      {column.tasks.length === 0 && (
        <p className="column__empty">
          {isNormal ? 'Suelta una tarea aquí' : 'No hay tareas en esta columna'}
        </p>
      )}
    </div>
  );
}
