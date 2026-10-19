// REGLAS DE NEGOCIO de las tareas.
// Son funciones "puras": reciben datos y devuelven datos nuevos, sin tocar
// la pantalla ni modificar nada por fuera. Por eso son fáciles de entender
// y de probar. Ningún componente visual decide estas reglas: solo las usa.
import { isDateReached, todayISO } from './dateRules.js';

// Tipos de lista que el usuario puede elegir en el selector.
export const FREQUENCIES = [
  { id: 'daily', label: 'Mis tareas diarias', shortLabel: 'Diarias' },
  { id: 'monthly', label: 'Mis tareas mensuales', shortLabel: 'Mensuales' },
  { id: 'yearly', label: 'Mis tareas anuales', shortLabel: 'Anuales' },
];

export const DEFAULT_FREQUENCY = 'daily';

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
export function createTask({ title, dueDate = null, frequency = DEFAULT_FREQUENCY }) {
  return {
    id: `task-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    title: title.trim(),
    description: '',
    dueDate,
    frequency,
    completed: false,
  };
}

// Agrega una tarea al final de la lista.
export function addTask(tasks, data) {
  if (!isValidTitle(data.title)) return tasks;
  return [...tasks, createTask(data)];
}

// Sobrescribe los datos de una tarea (título, descripción, fecha o lista).
export function updateTask(tasks, taskId, changes) {
  if (changes.title !== undefined && !isValidTitle(changes.title)) return tasks;
  return tasks.map((task) => {
    if (task.id !== taskId) return task;
    const updated = { ...task, ...changes };
    if (changes.title !== undefined) updated.title = changes.title.trim();
    if (changes.description !== undefined) updated.description = changes.description.trim();
    return updated;
  });
}

// Elimina todas las tareas cuyos ids estén en la lista.
export function deleteTasks(tasks, taskIds) {
  return tasks.filter((task) => !taskIds.includes(task.id));
}

// Cambia una tarea de pendiente a completada (o al revés).
export function toggleTask(tasks, taskId) {
  return tasks.map((task) =>
    task.id === taskId ? { ...task, completed: !task.completed } : task
  );
}

// Devuelve solo las tareas de un tipo de lista (diarias, mensuales o anuales).
export function getTasksByFrequency(tasks, frequencyId) {
  return tasks.filter((task) => task.frequency === frequencyId);
}

// Devuelve solo las tareas que pertenecen a una columna.
export function getTasksByColumn(tasks, columnId) {
  const column = COLUMNS.find((col) => col.id === columnId);
  return tasks.filter((task) => task.completed === column.completed);
}

// Regla: una tarea está vencida si su fecha ya se cumplió y sigue sin completarse.
export function isOverdue(task, today = todayISO()) {
  return !task.completed && isDateReached(task.dueDate, today);
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

// Estadísticas de cumplimiento de un grupo de tareas:
//   cumplidas, pendientes a tiempo, vencidas y el % de cumplimiento.
export function getComplianceStats(tasks, today = todayISO()) {
  const completed = tasks.filter((task) => task.completed).length;
  const overdue = tasks.filter((task) => isOverdue(task, today)).length;
  const total = tasks.length;
  return {
    total,
    completed,
    overdue,
    pending: total - completed - overdue,
    rate: total === 0 ? 0 : Math.round((completed / total) * 100),
  };
}

// Estadísticas de cumplimiento para cada tipo de lista (para comparar).
export function getComplianceByFrequency(tasks, today = todayISO()) {
  return FREQUENCIES.map((frequency) => ({
    ...frequency,
    ...getComplianceStats(getTasksByFrequency(tasks, frequency.id), today),
  }));
}
