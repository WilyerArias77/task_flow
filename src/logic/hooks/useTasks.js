// HOOK DE ESTADO de las tareas.
// Un "hook" es una función de React que guarda información que puede cambiar.
// Aquí viven las tareas del usuario que inició sesión y qué lista se está
// viendo (diarias, mensuales o anuales).
//
// Cómo se guardan los cambios: primero se muestran en pantalla (para que la
// app se sienta rápida) y enseguida se guardan en la base de datos. Si el
// guardado falla, se muestra un aviso y se vuelven a cargar los datos reales.
//
// Las páginas usan este hook; los componentes visuales nunca cambian la lista
// directamente, solo llaman a las acciones que este hook les entrega.
import { useCallback, useEffect, useState } from 'react';
import * as taskService from '../services/taskService.js';
import { todayISO } from '../rules/dateRules.js';
import {
  COLUMNS,
  FREQUENCIES,
  DEFAULT_FREQUENCY,
  createTask,
  normalizeTaskChanges,
  updateTask,
  deleteTasks,
  moveTask,
  getTasksByFrequency,
  getTasksByColumn,
  getComplianceStats,
  getComplianceByFrequency,
  isOverdue,
} from '../rules/taskRules.js';

const SAVE_ERROR = 'No se pudo guardar el último cambio. Revisa tu conexión e inténtalo de nuevo.';
const LOAD_ERROR = 'No se pudieron cargar tus tareas. Revisa tu conexión y recarga la página.';

export function useTasks(userId) {
  const [tasks, setTasks] = useState([]);
  const [status, setStatus] = useState('loading'); // 'loading' | 'ready' | 'error'
  const [error, setError] = useState(null);
  const [frequencyId, setFrequencyId] = useState(DEFAULT_FREQUENCY);
  const today = todayISO();

  // Carga las tareas del usuario desde la base de datos
  const load = useCallback(async () => {
    try {
      setTasks(await taskService.fetchTasks());
      setStatus('ready');
    } catch {
      setError(LOAD_ERROR);
      setStatus('error');
    }
  }, []);

  useEffect(() => {
    setStatus('loading');
    load();
  }, [load, userId]);

  // Guarda en la base de datos; si falla, avisa y recarga los datos reales
  const persist = async (operation) => {
    try {
      await operation();
    } catch {
      setError(SAVE_ERROR);
      load();
    }
  };

  // ---------- Acciones disponibles para la interfaz ----------

  // Las tareas nuevas se crean en la lista que se está viendo
  const add = ({ title, dueDate }) => {
    const task = createTask(tasks, { title, dueDate, frequency: frequencyId });
    setTasks((current) => [...current, task]);
    persist(() => taskService.insertTask(task));
  };

  const update = (taskId, changes) => {
    const normalized = normalizeTaskChanges(changes);
    if (!normalized) return;
    setTasks((current) => updateTask(current, taskId, normalized));
    persist(() => taskService.updateTask(taskId, normalized));
  };

  const remove = (taskIds) => {
    setTasks((current) => deleteTasks(current, taskIds));
    persist(() => taskService.deleteTasks(taskIds));
  };

  const toggle = (taskId) => {
    const task = tasks.find((t) => t.id === taskId);
    if (task) update(taskId, { completed: !task.completed });
  };

  const move = (taskId, columnId, beforeTaskId) => {
    const reordered = moveTask(tasks, taskId, columnId, beforeTaskId);
    const moved = reordered.find((t) => t.id === taskId);
    setTasks(reordered);
    if (moved) {
      persist(() =>
        taskService.updateTask(taskId, { completed: moved.completed, position: moved.position })
      );
    }
  };

  // ---------- Datos ya preparados para pintar la lista seleccionada ----------
  const visibleTasks = getTasksByFrequency(tasks, frequencyId);
  const columns = COLUMNS.map((column) => ({
    ...column,
    tasks: getTasksByColumn(visibleTasks, column.id).map((task) => ({
      ...task,
      isOverdue: isOverdue(task, today),
    })),
  }));

  return {
    status,
    error,
    dismissError: () => setError(null),
    frequencies: FREQUENCIES,
    currentFrequency: FREQUENCIES.find((f) => f.id === frequencyId),
    columns,
    stats: getComplianceStats(visibleTasks, today),
    statsByFrequency: getComplianceByFrequency(tasks, today),
    setFrequency: setFrequencyId,
    addTask: add,
    updateTask: update,
    deleteTasks: remove,
    toggleTask: toggle,
    moveTask: move,
  };
}
