// SERVICIO DE TAREAS E HISTORIAL (leer y guardar en la base de datos).
// Traduce entre el formato de la app (dueDate, completed...) y el de la
// base de datos (due_date, completed...). Gracias a las reglas RLS, cada
// consulta solo ve y modifica las tareas del usuario que inició sesión.
import { supabase } from './supabaseClient.js';

const COLUMNS = 'id, title, description, due_date, frequency, recurring, completed, position';

// Base de datos -> app
const fromRow = (row) => ({
  id: row.id,
  title: row.title,
  description: row.description,
  dueDate: row.due_date,
  frequency: row.frequency,
  recurring: row.recurring,
  completed: row.completed,
  position: row.position,
});

// App -> base de datos (solo los campos presentes)
const toRow = (task) => {
  const row = {};
  if (task.id !== undefined) row.id = task.id;
  if (task.title !== undefined) row.title = task.title;
  if (task.description !== undefined) row.description = task.description;
  if (task.dueDate !== undefined) row.due_date = task.dueDate;
  if (task.frequency !== undefined) row.frequency = task.frequency;
  if (task.recurring !== undefined) row.recurring = task.recurring;
  if (task.completed !== undefined) row.completed = task.completed;
  if (task.position !== undefined) row.position = task.position;
  return row;
};

export async function fetchTasks() {
  const { data, error } = await supabase
    .from('taskflow_tasks')
    .select(COLUMNS)
    .order('position', { ascending: true })
    .order('created_at', { ascending: true });
  if (error) throw error;
  return data.map(fromRow);
}

export async function insertTask(task) {
  const { error } = await supabase.from('taskflow_tasks').insert(toRow(task));
  if (error) throw error;
}

export async function updateTask(taskId, changes) {
  const { error } = await supabase.from('taskflow_tasks').update(toRow(changes)).eq('id', taskId);
  if (error) throw error;
}

export async function deleteTasks(taskIds) {
  const { error } = await supabase.from('taskflow_tasks').delete().in('id', taskIds);
  if (error) throw error;
}

// ---------- Historial de cumplimiento ----------

const fromCompletionRow = (row) => ({
  id: row.id,
  taskId: row.task_id,
  taskTitle: row.task_title,
  frequency: row.frequency,
  dueDate: row.due_date,
  completedAt: row.completed_at,
});

// Cumplimientos registrados desde una fecha ("aaaa-mm-dd")
export async function fetchCompletions(sinceISO) {
  const { data, error } = await supabase
    .from('taskflow_completions')
    .select('id, task_id, task_title, frequency, due_date, completed_at')
    .gte('completed_at', sinceISO)
    .order('completed_at', { ascending: false });
  if (error) throw error;
  return data.map(fromCompletionRow);
}

export async function insertCompletion(completion) {
  const { error } = await supabase.from('taskflow_completions').insert({
    id: completion.id,
    task_id: completion.taskId,
    task_title: completion.taskTitle,
    frequency: completion.frequency,
    due_date: completion.dueDate,
    completed_at: completion.completedAt,
  });
  if (error) throw error;
}

// Borra el registro del ciclo actual de una tarea (cuando se desmarca)
export async function deleteCompletionsForCycle(taskId, dueDate) {
  let query = supabase.from('taskflow_completions').delete().eq('task_id', taskId);
  query = dueDate ? query.eq('due_date', dueDate) : query.is('due_date', null);
  const { error } = await query;
  if (error) throw error;
}
