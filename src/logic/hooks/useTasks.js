// HOOK DE ESTADO de las tareas.
// Un "hook" es una función de React que guarda información que puede cambiar.
// Aquí vive la lista de tareas mientras la app está abierta (se pierde al
// recargar: todavía no hay base de datos) y qué lista se está viendo
// (diarias, mensuales o anuales).
// Las páginas usan este hook; los componentes visuales nunca cambian la lista
// directamente, solo llaman a las acciones que este hook les entrega.
import { useState } from 'react';
import { mockTasks } from '../data/mockTasks.js';
import { todayISO } from '../rules/dateRules.js';
import {
  COLUMNS,
  FREQUENCIES,
  DEFAULT_FREQUENCY,
  addTask,
  updateTask,
  deleteTasks,
  toggleTask,
  moveTask,
  getTasksByFrequency,
  getTasksByColumn,
  getComplianceStats,
  getComplianceByFrequency,
  isOverdue,
} from '../rules/taskRules.js';

export function useTasks() {
  const [tasks, setTasks] = useState(mockTasks);
  const [frequencyId, setFrequencyId] = useState(DEFAULT_FREQUENCY);
  const today = todayISO();

  // Acciones disponibles para la interfaz.
  // Las tareas nuevas se crean en la lista que se está viendo.
  const add = ({ title, dueDate }) =>
    setTasks((current) => addTask(current, { title, dueDate, frequency: frequencyId }));
  const update = (taskId, changes) =>
    setTasks((current) => updateTask(current, taskId, changes));
  const remove = (taskIds) => setTasks((current) => deleteTasks(current, taskIds));
  const toggle = (taskId) => setTasks((current) => toggleTask(current, taskId));
  const move = (taskId, columnId, beforeTaskId) =>
    setTasks((current) => moveTask(current, taskId, columnId, beforeTaskId));

  // Datos ya preparados para pintar la lista seleccionada
  const visibleTasks = getTasksByFrequency(tasks, frequencyId);
  const columns = COLUMNS.map((column) => ({
    ...column,
    tasks: getTasksByColumn(visibleTasks, column.id).map((task) => ({
      ...task,
      isOverdue: isOverdue(task, today),
    })),
  }));

  return {
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
