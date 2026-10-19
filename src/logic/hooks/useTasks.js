// HOOK DE ESTADO de las tareas y su historial.
// Un "hook" es una función de React que guarda información que puede cambiar.
// Aquí viven las tareas del usuario que inició sesión, su historial de
// cumplimiento y qué lista se está viendo (diarias, mensuales o anuales).
//
// Cómo se guardan los cambios: primero se muestran en pantalla (para que la
// app se sienta rápida) y enseguida se guardan en la base de datos. Si el
// guardado falla, se muestra un aviso y se vuelven a cargar los datos reales.
//
// Cada vez que se cargan los datos (al entrar o al volver a la pestaña) se
// renuevan las tareas recurrentes cuyo ciclo ya terminó.
//
// Las páginas usan este hook; los componentes visuales nunca cambian la lista
// directamente, solo llaman a las acciones que este hook les entrega.
import { useCallback, useEffect, useState } from 'react';
import * as taskService from '../services/taskService.js';
import { addDaysISO, todayISO } from '../rules/dateRules.js';
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
  getRenewals,
  applyRenewals,
  createCompletion,
  isSameCycle,
  getHistory,
  getPeriodStats,
  getPeriodStatsByFrequency,
  isOverdue,
} from '../rules/taskRules.js';

const SAVE_ERROR = 'No se pudo guardar el último cambio. Revisa tu conexión e inténtalo de nuevo.';
const LOAD_ERROR = 'No se pudieron cargar tus tareas. Revisa tu conexión y recarga la página.';

// Historial que se carga: el último año (cubre el periodo anual y el historial visible)
const HISTORY_DAYS = 366;

export function useTasks(userId) {
  const [tasks, setTasks] = useState([]);
  const [completions, setCompletions] = useState([]);
  const [status, setStatus] = useState('loading'); // 'loading' | 'ready' | 'error'
  const [error, setError] = useState(null);
  const [frequencyId, setFrequencyId] = useState(DEFAULT_FREQUENCY);
  const today = todayISO();

  // Carga tareas e historial, y renueva las tareas recurrentes vencidas
  const load = useCallback(async () => {
    try {
      const [loadedTasks, loadedCompletions] = await Promise.all([
        taskService.fetchTasks(),
        taskService.fetchCompletions(addDaysISO(-HISTORY_DAYS)),
      ]);
      const renewals = getRenewals(loadedTasks);
      setTasks(applyRenewals(loadedTasks, renewals));
      setCompletions(loadedCompletions);
      setStatus('ready');
      await Promise.all(
        renewals.map((renewal) => taskService.updateTask(renewal.id, renewal.changes))
      );
    } catch {
      setError(LOAD_ERROR);
      setStatus((current) => (current === 'loading' ? 'error' : current));
    }
  }, []);

  useEffect(() => {
    setStatus('loading');
    load();
  }, [load, userId]);

  // Al volver a la pestaña se recargan los datos: así se ven los cambios
  // hechos en otro dispositivo y se renuevan las tareas si cambió el día.
  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') load();
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, [load]);

  // Guarda en la base de datos; si falla, avisa y recarga los datos reales
  const persist = async (operation) => {
    try {
      await operation();
    } catch {
      setError(SAVE_ERROR);
      load();
    }
  };

  // Registra o borra el historial cuando una tarea cambia de estado
  const syncHistory = (task, nowCompleted) => {
    if (nowCompleted && !task.completed) {
      const completion = createCompletion(task);
      setCompletions((current) => [completion, ...current]);
      return () => taskService.insertCompletion(completion);
    }
    if (!nowCompleted && task.completed) {
      setCompletions((current) => current.filter((c) => !isSameCycle(c, task)));
      return () => taskService.deleteCompletionsForCycle(task.id, task.dueDate);
    }
    return null;
  };

  // ---------- Acciones disponibles para la interfaz ----------

  // Las tareas nuevas se crean en la lista que se está viendo
  const add = ({ title, dueDate }) => {
    const task = createTask(tasks, { title, dueDate, frequency: frequencyId });
    setTasks((current) => [...current, task]);
    persist(() => taskService.insertTask(task));
  };

  const update = (taskId, changes) => {
    const task = tasks.find((t) => t.id === taskId);
    const normalized = normalizeTaskChanges(changes);
    if (!task || !normalized) return;

    const saveHistory =
      normalized.completed !== undefined ? syncHistory(task, normalized.completed) : null;
    setTasks((current) => updateTask(current, taskId, normalized));
    persist(async () => {
      await taskService.updateTask(taskId, normalized);
      if (saveHistory) await saveHistory();
    });
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
    const task = tasks.find((t) => t.id === taskId);
    const reordered = moveTask(tasks, taskId, columnId, beforeTaskId);
    const moved = reordered.find((t) => t.id === taskId);
    if (!task || !moved) return;

    const saveHistory = syncHistory(task, moved.completed);
    setTasks(reordered);
    persist(async () => {
      await taskService.updateTask(taskId, { completed: moved.completed, position: moved.position });
      if (saveHistory) await saveHistory();
    });
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
    stats: getPeriodStats(tasks, completions, frequencyId, today),
    statsByFrequency: getPeriodStatsByFrequency(tasks, completions, today),
    history: getHistory(completions, frequencyId),
    setFrequency: setFrequencyId,
    addTask: add,
    updateTask: update,
    deleteTasks: remove,
    toggleTask: toggle,
    moveTask: move,
  };
}
