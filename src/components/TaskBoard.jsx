// TABLERO: muestra las columnas una al lado de la otra.
// Recibe todo ya preparado desde la página y solo lo reparte.
import TaskColumn from './TaskColumn.jsx';

export default function TaskBoard({ columns, ...boardProps }) {
  return (
    <div className="board">
      {columns.map((column) => (
        <TaskColumn key={column.id} column={column} {...boardProps} />
      ))}
    </div>
  );
}
