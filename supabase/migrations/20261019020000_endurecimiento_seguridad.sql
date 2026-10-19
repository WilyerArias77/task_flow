-- =====================================================================
-- TaskFlow · Endurecimiento de seguridad (auditoría 2026-10-19)
-- =====================================================================
-- Ejecutar DESPUÉS de los dos scripts anteriores. Se puede ejecutar más
-- de una vez sin error.
--
-- Principio: cada rol tiene SOLO los permisos que la app necesita, y las
-- reglas RLS (seguridad por fila) limitan cada operación a los datos del
-- propio usuario. Así, aunque alguien use la API directamente (sin la app),
-- no puede ver ni tocar datos ajenos, ni alterar evidencias legales, ni
-- llenar la base de datos.
-- =====================================================================


-- ---------- 1. Tablas de la web (leads, keepalive) ----------
-- Ahora el proyecto tiene usuarios con sesión (rol "authenticated").
-- La web guarda los leads desde su servidor con la clave secreta, que no
-- depende de estos permisos; por eso se quitan a anon y authenticated.
revoke all on table public.leads from anon, authenticated;
revoke all on table public.keepalive from anon, authenticated;


-- ---------- 2. Permisos mínimos en las tablas de TaskFlow ----------
-- Los visitantes sin sesión (anon) no necesitan nada.
revoke all on table public.taskflow_profiles, public.taskflow_tasks, public.taskflow_completions
  from anon, authenticated;

-- Perfil: solo lectura. Lo crea el sistema al registrarse y nadie lo edita
-- desde la API (protege la fecha de aceptación de la política de datos).
grant select on table public.taskflow_profiles to authenticated;

-- Tareas: solo las columnas que usa la app. No se puede fijar ni cambiar
-- user_id (siempre es el usuario de la sesión), ni las fechas de auditoría.
grant select, delete on table public.taskflow_tasks to authenticated;
grant insert (id, title, description, due_date, frequency, recurring, completed, position)
  on table public.taskflow_tasks to authenticated;
grant update (title, description, due_date, frequency, recurring, completed, position)
  on table public.taskflow_tasks to authenticated;

-- Historial: se consulta, se registra y se corrige (al desmarcar); no se edita.
grant select, delete on table public.taskflow_completions to authenticated;
grant insert (id, task_id, task_title, frequency, due_date, completed_at)
  on table public.taskflow_completions to authenticated;


-- ---------- 3. Reglas RLS ----------
-- Perfil: se elimina la regla de edición (la app no la usa).
drop policy if exists "Cada usuario actualiza su perfil" on public.taskflow_profiles;

-- Historial: solo puede apuntar a una tarea PROPIA (o a ninguna).
drop policy if exists "Cada usuario registra su historial" on public.taskflow_completions;
create policy "Cada usuario registra su historial"
  on public.taskflow_completions for insert to authenticated
  with check (
    (select auth.uid()) = user_id
    and (
      task_id is null
      or exists (
        select 1 from public.taskflow_tasks t
        where t.id = task_id and t.user_id = (select auth.uid())
      )
    )
  );


-- ---------- 4. Validación de datos ----------
alter table public.taskflow_tasks
  drop constraint if exists taskflow_tasks_position_finite;
alter table public.taskflow_tasks
  add constraint taskflow_tasks_position_finite
  check (position <> 'NaN'::float8 and position <> 'Infinity'::float8 and position <> '-Infinity'::float8);

alter table public.taskflow_completions
  drop constraint if exists taskflow_completions_not_future;
alter table public.taskflow_completions
  add constraint taskflow_completions_not_future
  check (completed_at <= now() + interval '1 day');

-- Nombre y empresa del registro: se recortan a 120 caracteres
create or replace function public.taskflow_trim_profile()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.full_name := left(btrim(new.full_name), 120);
  new.company := left(btrim(new.company), 120);
  return new;
end;
$$;

drop trigger if exists taskflow_profiles_trim on public.taskflow_profiles;
create trigger taskflow_profiles_trim
  before insert or update on public.taskflow_profiles
  for each row execute function public.taskflow_trim_profile();


-- ---------- 5. Límites anti-abuso ----------
-- Evita que una cuenta llene la base de datos (que comparte con los leads).
-- 1.000 tareas y 20.000 registros de historial por usuario son mucho más de
-- lo que necesita un uso normal (10 tareas diarias durante 5 años ≈ 18.000).
create or replace function public.taskflow_enforce_limits()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  current_count integer;
begin
  if tg_table_name = 'taskflow_tasks' then
    select count(*) into current_count from public.taskflow_tasks where user_id = new.user_id;
    if current_count >= 1000 then
      raise exception 'TASKFLOW_LIMIT: máximo 1000 tareas por usuario';
    end if;
  else
    select count(*) into current_count from public.taskflow_completions where user_id = new.user_id;
    if current_count >= 20000 then
      raise exception 'TASKFLOW_LIMIT: máximo 20000 registros de historial por usuario';
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists taskflow_tasks_limit on public.taskflow_tasks;
create trigger taskflow_tasks_limit
  before insert on public.taskflow_tasks
  for each row execute function public.taskflow_enforce_limits();

drop trigger if exists taskflow_completions_limit on public.taskflow_completions;
create trigger taskflow_completions_limit
  before insert on public.taskflow_completions
  for each row execute function public.taskflow_enforce_limits();


-- ---------- 6. Funciones internas: nadie las llama desde la API ----------
revoke execute on function public.taskflow_trim_profile() from public, anon, authenticated;
revoke execute on function public.taskflow_enforce_limits() from public, anon, authenticated;
revoke execute on function public.taskflow_set_updated_at() from public, anon, authenticated;
revoke execute on function public.taskflow_handle_new_user() from public, anon, authenticated;
-- Única función pública: eliminar la propia cuenta (solo con sesión)
revoke execute on function public.taskflow_delete_my_account() from public, anon;
grant execute on function public.taskflow_delete_my_account() to authenticated;


-- ---------- 7. Panel privado ----------
revoke all on schema taskflow_admin from public, anon, authenticated;
revoke all on all tables in schema taskflow_admin from public, anon, authenticated;
