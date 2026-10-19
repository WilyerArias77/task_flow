// COLUMNA del tablero (ej: "Pendientes" o "Completadas").
// Pinta su título, el contador y sus tarjetas. También es una zona donde
// se pueden soltar tarjetas: las props de arrastre vienen del hook.
import TaskCard from './TaskCard.jsx';

export default function TaskColumn({ column, onToggleTask, dragAndDrop }) {
  const { overColumnId, draggingId, getColumnProps, getCardProps } = dragAndDrop;
  const isOver = overColumnId === column.id;

  return (
    <div
      className={`column ${isOver ? 'column--over' : ''}`}
      {...getColumnProps(column.id)}
    >
      <div className="column__header">
        <h3 className="column__title">{column.title}</h3>
        <span className="column__count">{column.tasks.length}</span>
      </div>

      <ul className="column__list">
        {column.tasks.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            isDragging={draggingId === task.id}
            onToggle={onToggleTask}
            dragProps={getCardProps(task.id, column.id)}
          />
        ))}
      </ul>

      {column.tasks.length === 0 && (
        <p className="column__empty">Suelta una tarea aquí</p>
      )}
    </div>
  );
}
