-- =====================================================================
-- TaskFlow · Recurrencia, historial, eliminar cuenta y panel de uso
-- =====================================================================
-- Ejecutar DESPUÉS de 20261019000000_taskflow_schema.sql.
-- Qué agrega:
--   1. taskflow_tasks.recurring: la tarea se renueva sola cada día/mes/año.
--   2. taskflow_completions: historial de cada vez que se cumple una tarea.
--   3. taskflow_delete_my_account(): el usuario puede borrar su cuenta y datos.
--   4. Esquema privado taskflow_admin con vistas de uso para el administrador
--      (NO se publica en la API: solo se consulta desde el panel de Supabase).
-- =====================================================================


-- ---------- 1. Tareas recurrentes ----------
alter table public.taskflow_tasks
  add column recurring boolean not null default true;

comment on column public.taskflow_tasks.recurring is
  'Si es true, al pasar su fecha estando cumplida, la tarea vuelve a pendiente con la fecha del siguiente ciclo.';


-- ---------- 2. Historial de cumplimiento ----------
create table public.taskflow_completions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  -- Si la tarea se elimina, el historial se conserva (task_id queda vacío)
  task_id uuid references public.taskflow_tasks (id) on delete set null,
  task_title text not null check (char_length(task_title) between 1 and 200),
  frequency text not null check (frequency in ('daily', 'monthly', 'yearly')),
  due_date date,
  completed_at timestamptz not null default now()
);

comment on table public.taskflow_completions is 'Historial: cada vez que un usuario cumple una tarea.';

create index taskflow_completions_user_completed_idx
  on public.taskflow_completions (user_id, completed_at desc);
create index taskflow_completions_task_idx
  on public.taskflow_completions (task_id);

alter table public.taskflow_completions enable row level security;

create policy "Cada usuario ve su historial"
  on public.taskflow_completions for select to authenticated
  using ((select auth.uid()) = user_id);

create policy "Cada usuario registra su historial"
  on public.taskflow_completions for insert to authenticated
  with check ((select auth.uid()) = user_id);

create policy "Cada usuario corrige su historial"
  on public.taskflow_completions for delete to authenticated
  using ((select auth.uid()) = user_id);

-- Las tareas que ya estaban cumplidas entran al historial
insert into public.taskflow_completions (user_id, task_id, task_title, frequency, due_date, completed_at)
select user_id, id, title, frequency, due_date, updated_at
from public.taskflow_tasks
where completed;


-- ---------- Alta de usuario: tareas de ejemplo + su historial ----------
-- Las cumplidas de ejemplo tienen fecha de hoy o futura (se hicieron a tiempo).
create or replace function public.taskflow_handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.taskflow_profiles (id, full_name, company, marketing_consent)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    coalesce(new.raw_user_meta_data ->> 'company', ''),
    coalesce((new.raw_user_meta_data ->> 'marketing_consent')::boolean, false)
  );

  insert into public.taskflow_tasks (user_id, title, description, due_date, frequency, completed, position)
  values
    -- Diarias
    (new.id, 'Facturación electrónica de ventas del día', 'Emitir las facturas y enviarlas a los clientes.', current_date, 'daily', true, 1),
    (new.id, 'Arqueo de caja', 'Contar el efectivo y cuadrarlo con los recibos del día.', current_date - 1, 'daily', false, 2),
    (new.id, 'Causación de facturas de proveedores', 'Registrar las facturas electrónicas recibidas.', current_date + 1, 'daily', false, 3),
    (new.id, 'Seguimiento de cartera vencida', 'Contactar a los clientes con facturas de más de 60 días.', current_date + 2, 'daily', false, 4),
    (new.id, 'Programar pagos a proveedores', 'Preparar el lote de pagos según vencimientos.', current_date - 2, 'daily', false, 5),
    -- Mensuales
    (new.id, 'Conciliación bancaria del mes', 'Comparar los extractos bancarios con el libro auxiliar de bancos.', current_date - 4, 'monthly', false, 6),
    (new.id, 'Liquidar nómina de la quincena', 'Incluir horas extra, novedades, incapacidades y deducciones.', current_date + 11, 'monthly', false, 7),
    (new.id, 'Pago de seguridad social (PILA)', 'Validar aportes de salud, pensión, ARL y parafiscales.', current_date + 3, 'monthly', false, 8),
    (new.id, 'Declaración de retención en la fuente', 'Presentar y pagar ante la DIAN antes del vencimiento.', current_date + 5, 'monthly', false, 9),
    (new.id, 'Declaración bimestral de IVA', 'Revisar IVA generado y descontable antes de presentar.', current_date + 6, 'monthly', true, 10),
    (new.id, 'Cierre contable mensual', 'Registrar depreciaciones, provisiones y ajustes; generar estados financieros.', current_date + 12, 'monthly', false, 11),
    -- Anuales
    (new.id, 'Renovación de la matrícula mercantil', 'Renovar ante la Cámara de Comercio.', current_date + 120, 'yearly', true, 12),
    (new.id, 'Declaración de renta de la empresa', 'Preparar, presentar y pagar ante la DIAN.', current_date + 60, 'yearly', true, 13),
    (new.id, 'Información exógena (medios magnéticos)', 'Reportar a la DIAN los terceros y operaciones del año.', current_date - 120, 'yearly', false, 14),
    (new.id, 'Inventario físico de fin de año', 'Contar existencias y ajustar diferencias contra el sistema.', current_date + 70, 'yearly', false, 15),
    (new.id, 'Estados financieros de fin de año', 'Preparar balance, estado de resultados y notas para la asamblea.', current_date + 100, 'yearly', false, 16);

  insert into public.taskflow_completions (user_id, task_id, task_title, frequency, due_date)
  select user_id, id, title, frequency, due_date
  from public.taskflow_tasks
  where user_id = new.id and completed;

  return new;
end;
$$;

revoke execute on function public.taskflow_handle_new_user() from public, anon, authenticated;


-- ---------- 3. Eliminar mi cuenta (Ley 1581: derecho de supresión) ----------
-- Borra al usuario que llama; en cascada se borran perfil, tareas e historial.
create function public.taskflow_delete_my_account()
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if auth.uid() is null then
    raise exception 'Se requiere una sesión activa';
  end if;
  delete from auth.users where id = auth.uid();
end;
$$;

revoke execute on function public.taskflow_delete_my_account() from public, anon;
grant execute on function public.taskflow_delete_my_account() to authenticated;


-- ---------- 4. Panel de uso (privado, solo para el administrador) ----------
-- Consultar desde Supabase > SQL Editor:
--   select * from taskflow_admin.resumen;
--   select * from taskflow_admin.usuarios;
create schema taskflow_admin;
revoke all on schema taskflow_admin from public, anon, authenticated;

create view taskflow_admin.usuarios as
select
  u.email,
  p.full_name as nombre,
  p.company as empresa,
  p.marketing_consent as acepta_comunicaciones,
  p.data_policy_accepted_at as acepto_politica,
  u.created_at as registrado,
  u.email_confirmed_at is not null as correo_confirmado,
  greatest(
    u.last_sign_in_at,
    (select max(t.updated_at) from public.taskflow_tasks t where t.user_id = u.id),
    (select max(c.completed_at) from public.taskflow_completions c where c.user_id = u.id)
  ) as ultima_actividad,
  (select count(*) from public.taskflow_tasks t where t.user_id = u.id) as tareas,
  (select count(*) from public.taskflow_completions c
     where c.user_id = u.id and c.completed_at > now() - interval '30 days') as cumplidas_30_dias
from auth.users u
join public.taskflow_profiles p on p.id = u.id
order by u.created_at desc;

create view taskflow_admin.resumen as
select
  count(*) as usuarios,
  count(*) filter (where correo_confirmado) as confirmados,
  count(*) filter (where ultima_actividad > now() - interval '7 days') as activos_7_dias,
  count(*) filter (where ultima_actividad > now() - interval '30 days') as activos_30_dias,
  count(*) filter (where acepta_comunicaciones) as aceptan_comunicaciones,
  count(*) filter (where registrado > now() - interval '30 days') as nuevos_30_dias
from taskflow_admin.usuarios;

revoke all on all tables in schema taskflow_admin from public, anon, authenticated;
