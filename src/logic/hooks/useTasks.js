// HOOK DE ESTADO de las tareas.
// Un "hook" es una función de React que guarda información que puede cambiar.
// Aquí vive la lista de tareas mientras la app está abierta (se pierde al
// recargar: todavía no hay base de datos).
// Las páginas usan este hook; los componentes visuales nunca cambian la lista
// directamente, solo llaman a las acciones que este hook les entrega.
import { useState } from 'react';
import { mockTasks } from '../data/mockTasks.js';
import {
  COLUMNS,
  addTask,
  toggleTask,
  moveTask,
  getTasksByColumn,
  getStats,
} from '../rules/taskRules.js';

export function useTasks() {
  const [tasks, setTasks] = useState(mockTasks);

  // Acciones disponibles para la interfaz
  const add = (title) => setTasks((current) => addTask(current, title));
  const toggle = (taskId) => setTasks((current) => toggleTask(current, taskId));
  const move = (taskId, columnId, beforeTaskId) =>
    setTasks((current) => moveTask(current, taskId, columnId, beforeTaskId));

  // Datos ya preparados para pintar el tablero
  const columns = COLUMNS.map((column) => ({
    ...column,
    tasks: getTasksByColumn(tasks, column.id),
  }));

  return {
    columns,
    stats: getStats(tasks),
    addTask: add,
    toggleTask: toggle,
    moveTask: move,
  };
}
