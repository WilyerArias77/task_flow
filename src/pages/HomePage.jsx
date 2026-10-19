// PANTALLA PRINCIPAL.
// Una "página" conecta la lógica (hooks) con los componentes visuales.
// Aquí se obtiene el estado y las acciones, y se pasan a cada componente.
import { useTasks } from '../logic/hooks/useTasks.js';
import { useDragAndDrop } from '../logic/hooks/useDragAndDrop.js';
import TaskForm from '../components/TaskForm.jsx';
import TaskBoard from '../components/TaskBoard.jsx';

export default function HomePage() {
  const { columns, stats, addTask, toggleTask, moveTask } = useTasks();
  const dragAndDrop = useDragAndDrop(moveTask);

  return (
    <section className="page">
      <div className="page__header">
        <div>
          <h2 className="page__title">Mis tareas</h2>
          <p className="page__subtitle">
            {stats.completed} de {stats.total} completadas · Arrastra las tarjetas para moverlas
          </p>
        </div>
        <TaskForm onAddTask={addTask} />
      </div>

      <TaskBoard
        columns={columns}
        onToggleTask={toggleTask}
        dragAndDrop={dragAndDrop}
      />
    </section>
  );
}
