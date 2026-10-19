// PANTALLA PRINCIPAL.
// Una "página" conecta la lógica (hooks) con los componentes visuales.
// Aquí se obtiene el estado y las acciones, y se pasan a cada componente.
import { useTasks } from '../logic/hooks/useTasks.js';
import { useDragAndDrop } from '../logic/hooks/useDragAndDrop.js';
import { useSelectionMode } from '../logic/hooks/useSelectionMode.js';
import FrequencySelector from '../components/FrequencySelector.jsx';
import ComplianceChart from '../components/ComplianceChart.jsx';
import TaskForm from '../components/TaskForm.jsx';
import TaskToolbar from '../components/TaskToolbar.jsx';
import SelectionBanner from '../components/SelectionBanner.jsx';
import TaskBoard from '../components/TaskBoard.jsx';
import ErrorBanner from '../components/ErrorBanner.jsx';

export default function HomePage({ userId }) {
  const tasks = useTasks(userId);
  const dragAndDrop = useDragAndDrop(tasks.moveTask);
  const selection = useSelectionMode({
    onDelete: tasks.deleteTasks,
    onUpdate: tasks.updateTask,
  });

  // Al cambiar de lista se sale de cualquier modo de edición o eliminación
  const handleFrequencyChange = (frequencyId) => {
    selection.cancel();
    tasks.setFrequency(frequencyId);
  };

  if (tasks.status === 'loading') {
    return <p className="page__loading">Cargando tus tareas…</p>;
  }

  return (
    <section className="page">
      {tasks.error && <ErrorBanner message={tasks.error} onClose={tasks.dismissError} />}

      <FrequencySelector
        options={tasks.frequencies}
        selectedId={tasks.currentFrequency.id}
        onSelect={handleFrequencyChange}
      />

      <div className="page__header">
        <h2 className="page__title">{tasks.currentFrequency.label}</h2>
        <p className="page__subtitle">
          {tasks.stats.completed} de {tasks.stats.total} completadas · Arrastra las
          tarjetas desde los puntos para moverlas
        </p>
      </div>

      <ComplianceChart
        title={tasks.currentFrequency.label}
        stats={tasks.stats}
        statsByFrequency={tasks.statsByFrequency}
      />

      {selection.mode === 'normal' ? (
        <div className="actions">
          <TaskForm onAddTask={tasks.addTask} />
          <TaskToolbar onEdit={selection.startEdit} onDelete={selection.startDelete} />
        </div>
      ) : (
        <SelectionBanner selection={selection} />
      )}

      <TaskBoard
        columns={tasks.columns}
        frequencies={tasks.frequencies}
        selection={selection}
        dragAndDrop={dragAndDrop}
        onToggleTask={tasks.toggleTask}
        onDueDateChange={(taskId, dueDate) => tasks.updateTask(taskId, { dueDate })}
      />
    </section>
  );
}
