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

// Posición para una tarea nueva: después de la última.
// La "posición" guarda el orden que el usuario arma con el drag and drop.
export function getNextPosition(tasks) {
  return tasks.reduce((max, task) => Math.max(max, task.position), 0) + 1;
}

// Crea una tarea nueva (siempre empieza como pendiente, al final de la lista).
// El id se genera aquí para poder mostrarla al instante, antes de guardarla.
export function createTask(tasks, { title, dueDate = null, frequency = DEFAULT_FREQUENCY }) {
  return {
    id: crypto.randomUUID(),
    title: title.trim(),
    description: '',
    dueDate,
    frequency,
    completed: false,
    position: getNextPosition(tasks),
  };
}

// Limpia los cambios antes de aplicarlos (quita espacios sobrantes).
// Devuelve null si los cambios no son válidos (por ejemplo, título vacío).
export function normalizeTaskChanges(changes) {
  if (changes.title !== undefined && !isValidTitle(changes.title)) return null;
  const normalized = { ...changes };
  if (changes.title !== undefined) normalized.title = changes.title.trim();
  if (changes.description !== undefined) normalized.description = changes.description.trim();
  return normalized;
}

// Sobrescribe los datos de una tarea (título, descripción, fecha o lista).
export function updateTask(tasks, taskId, changes) {
  const normalized = normalizeTaskChanges(changes);
  if (!normalized) return tasks;
  return tasks.map((task) => (task.id === taskId ? { ...task, ...normalized } : task));
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
// La nueva posición queda justo entre sus vecinas, así solo cambia esta tarea.
export function moveTask(tasks, taskId, columnId, beforeTaskId = null) {
  const task = tasks.find((t) => t.id === taskId);
  const column = COLUMNS.find((col) => col.id === columnId);
  if (!task || !column) return tasks;

  const rest = tasks.filter((t) => t.id !== taskId);
  const beforeIndex = beforeTaskId ? rest.findIndex((t) => t.id === beforeTaskId) : -1;
  const targetIndex = beforeIndex === -1 ? rest.length : beforeIndex;

  const previous = rest[targetIndex - 1];
  const next = rest[targetIndex];
  let position = 0;
  if (previous && next) position = (previous.position + next.position) / 2;
  else if (previous) position = previous.position + 1;
  else if (next) position = next.position - 1;

  const movedTask = { ...task, completed: column.completed, position };
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
