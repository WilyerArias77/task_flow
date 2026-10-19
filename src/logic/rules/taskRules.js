// REGLAS DE NEGOCIO de las tareas.
// Son funciones "puras": reciben datos y devuelven datos nuevos, sin tocar
// la pantalla ni modificar nada por fuera. Por eso son fáciles de entender
// y de probar. Ningún componente visual decide estas reglas: solo las usa.

// Columnas del tablero. Cada columna agrupa tareas según si están completadas.
export const COLUMNS = [
  { id: 'pending', title: 'Pendientes', completed: false },
  { id: 'done', title: 'Completadas', completed: true },
];

// Regla: un título válido no puede estar vacío ni tener solo espacios.
export function isValidTitle(title) {
  return title.trim().length > 0;
}

// Crea una tarea nueva (siempre empieza como pendiente).
export function createTask(title) {
  return {
    id: `task-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    title: title.trim(),
    description: '',
    completed: false,
  };
}

// Agrega una tarea al final de la lista.
export function addTask(tasks, title) {
  if (!isValidTitle(title)) return tasks;
  return [...tasks, createTask(title)];
}

// Cambia una tarea de pendiente a completada (o al revés).
export function toggleTask(tasks, taskId) {
  return tasks.map((task) =>
    task.id === taskId ? { ...task, completed: !task.completed } : task
  );
}

// Devuelve solo las tareas que pertenecen a una columna.
export function getTasksByColumn(tasks, columnId) {
  const column = COLUMNS.find((col) => col.id === columnId);
  return tasks.filter((task) => task.completed === column.completed);
}

// Mueve una tarea (usado por el drag and drop).
//   - taskId: la tarea que se arrastra
//   - columnId: la columna donde se suelta
//   - beforeTaskId: si se suelta encima de otra tarjeta, se coloca antes de ella;
//                   si es null, se coloca al final de la columna.
// Moverla a "Completadas" la marca como completada, y viceversa.
export function moveTask(tasks, taskId, columnId, beforeTaskId = null) {
  const task = tasks.find((t) => t.id === taskId);
  const column = COLUMNS.find((col) => col.id === columnId);
  if (!task || !column) return tasks;

  const movedTask = { ...task, completed: column.completed };
  const rest = tasks.filter((t) => t.id !== taskId);

  const targetIndex = beforeTaskId
    ? rest.findIndex((t) => t.id === beforeTaskId)
    : -1;

  if (targetIndex === -1) return [...rest, movedTask];
  return [...rest.slice(0, targetIndex), movedTask, ...rest.slice(targetIndex)];
}

// Resumen para mostrar al usuario: cuántas hay y cuántas están hechas.
export function getStats(tasks) {
  const completed = tasks.filter((task) => task.completed).length;
  return { total: tasks.length, completed };
}
