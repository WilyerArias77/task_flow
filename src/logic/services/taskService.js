// SERVICIO DE TAREAS (leer y guardar en la base de datos).
// Traduce entre el formato de la app (dueDate, completed...) y el de la
// base de datos (due_date, completed...). Gracias a las reglas RLS, cada
// consulta solo ve y modifica las tareas del usuario que inició sesión.
import { supabase } from './supabaseClient.js';

const COLUMNS = 'id, title, description, due_date, frequency, completed, position';

// Base de datos -> app
const fromRow = (row) => ({
  id: row.id,
  title: row.title,
  description: row.description,
  dueDate: row.due_date,
  frequency: row.frequency,
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
