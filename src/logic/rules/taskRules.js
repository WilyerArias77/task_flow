// REGLAS DE NEGOCIO de las tareas.
// Son funciones "puras": reciben datos y devuelven datos nuevos, sin tocar
// la pantalla ni modificar nada por fuera. Por eso son fáciles de entender
// y de probar. Ningún componente visual decide estas reglas: solo las usa.
import {
  addPeriodISO,
  getPeriodRange,
  isDateReached,
  isInRange,
  timestampToISODate,
  todayISO,
} from './dateRules.js';

// Tipos de lista que el usuario puede elegir en el selector.
//   - periodLabel: el periodo que mide el gráfico de cumplimiento
//   - everyLabel:  cómo se describe la repetición de la tarea
export const FREQUENCIES = [
  { id: 'daily', label: 'Mis tareas diarias', shortLabel: 'Diarias', periodLabel: 'hoy', everyLabel: 'cada día' },
  { id: 'monthly', label: 'Mis tareas mensuales', shortLabel: 'Mensuales', periodLabel: 'este mes', everyLabel: 'cada mes' },
  { id: 'yearly', label: 'Mis tareas anuales', shortLabel: 'Anuales', periodLabel: 'este año', everyLabel: 'cada año' },
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
    recurring: true,
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

// ---------- Tareas recurrentes ----------

// Regla de renovación: una tarea recurrente y cumplida, cuya fecha ya pasó,
// vuelve a "Pendientes" con la próxima fecha de su ciclo (hoy o después).
// Ejemplo mensual: vence el 10, se cumple el 9; el día 11 vuelve como
// pendiente con fecha 10 del mes siguiente.
export function getNextDueDate(task, today = todayISO()) {
  let next = addPeriodISO(task.dueDate, task.frequency);
  while (next < today) next = addPeriodISO(next, task.frequency);
  return next;
}

export function needsRenewal(task, today = todayISO()) {
  return task.recurring && task.completed && Boolean(task.dueDate) && task.dueDate < today;
}

// Devuelve los cambios a aplicar: [{ id, changes: { completed, dueDate } }]
export function getRenewals(tasks, today = todayISO()) {
  return tasks
    .filter((task) => needsRenewal(task, today))
    .map((task) => ({
      id: task.id,
      changes: { completed: false, dueDate: getNextDueDate(task, today) },
    }));
}

export function applyRenewals(tasks, renewals) {
  const byId = new Map(renewals.map((renewal) => [renewal.id, renewal.changes]));
  return tasks.map((task) => (byId.has(task.id) ? { ...task, ...byId.get(task.id) } : task));
}

// ---------- Historial de cumplimiento ----------

// Registro que se guarda cada vez que una tarea pasa a "cumplida".
export function createCompletion(task, now = new Date()) {
  return {
    id: crypto.randomUUID(),
    taskId: task.id,
    taskTitle: task.title,
    frequency: task.frequency,
    dueDate: task.dueDate,
    completedAt: now.toISOString(),
  };
}

// Regla: a tiempo si se cumplió el día de su fecha o antes (o si no tenía fecha).
export function isCompletedOnTime(completion) {
  return !completion.dueDate || timestampToISODate(completion.completedAt) <= completion.dueDate;
}

// Si el usuario desmarca una tarea, se borra el registro de ESE ciclo (misma fecha).
export function isSameCycle(completion, task) {
  return completion.taskId === task.id && completion.dueDate === task.dueDate;
}

// Últimos cumplimientos de una lista, del más reciente al más antiguo.
export function getHistory(completions, frequencyId, limit = 30) {
  return completions
    .filter((completion) => completion.frequency === frequencyId)
    .sort((a, b) => b.completedAt.localeCompare(a.completedAt))
    .slice(0, limit)
    .map((completion) => ({ ...completion, onTime: isCompletedOnTime(completion) }));
}

// ---------- Cumplimiento por periodo ----------

// Mide el periodo actual de la lista (hoy / este mes / este año):
//   - Cumplidas: registros del historial cuya fecha cae en el periodo.
//   - Vencidas: tareas pendientes cuya fecha ya llegó (de cualquier periodo:
//     siguen siendo una obligación sin cumplir).
//   - Pendientes a tiempo: tareas pendientes con fecha futura dentro del
//     periodo, o sin fecha.
export function getPeriodStats(tasks, completions, frequencyId, today = todayISO()) {
  const range = getPeriodRange(frequencyId, today);

  const completed = completions.filter(
    (completion) =>
      completion.frequency === frequencyId &&
      isInRange(completion.dueDate ?? timestampToISODate(completion.completedAt), range)
  ).length;

  const open = getTasksByFrequency(tasks, frequencyId).filter((task) => !task.completed);
  const overdue = open.filter((task) => isOverdue(task, today)).length;
  const pending = open.filter(
    (task) => !isOverdue(task, today) && (!task.dueDate || isInRange(task.dueDate, range))
  ).length;

  const total = completed + pending + overdue;
  return {
    total,
    completed,
    pending,
    overdue,
    rate: total === 0 ? 0 : Math.round((completed / total) * 100),
  };
}

// El mismo cálculo para las tres listas (para compararlas).
export function getPeriodStatsByFrequency(tasks, completions, today = todayISO()) {
  return FREQUENCIES.map((frequency) => ({
    ...frequency,
    ...getPeriodStats(tasks, completions, frequency.id, today),
  }));
}
