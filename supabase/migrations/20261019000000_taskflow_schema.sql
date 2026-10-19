-- =====================================================================
-- TaskFlow · Estructura de la base de datos (Supabase / PostgreSQL)
-- =====================================================================
-- Qué crea este script:
--   1. taskflow_profiles: datos de cada usuario (nombre, empresa, consentimientos).
--   2. taskflow_tasks: las tareas de cada usuario.
--   3. Seguridad por fila (RLS): cada usuario SOLO ve y modifica lo suyo.
--   4. Un disparador que, al registrarse un usuario, crea su perfil y le
--      copia las tareas de ejemplo (procesos administrativos y contables).
-- =====================================================================


-- ---------- 1. Perfiles ----------
create table public.taskflow_profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text not null default '',
  company text not null default '',
  -- Ley 1581 de 2012: fecha en que aceptó la política de tratamiento de datos
  data_policy_accepted_at timestamptz not null default now(),
  -- Autorización (opcional) para recibir comunicaciones de Growing Solutions
  marketing_consent boolean not null default false,
  created_at timestamptz not null default now()
);

comment on table public.taskflow_profiles is 'Datos de cada usuario de TaskFlow y sus consentimientos.';


-- ---------- 2. Tareas ----------
create table public.taskflow_tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  title text not null check (char_length(btrim(title)) between 1 and 200),
  description text not null default '' check (char_length(description) <= 500),
  due_date date,
  frequency text not null default 'daily' check (frequency in ('daily', 'monthly', 'yearly')),
  completed boolean not null default false,
  position double precision not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.taskflow_tasks is 'Tareas de cada usuario de TaskFlow.';

create index taskflow_tasks_user_position_idx on public.taskflow_tasks (user_id, position);

-- Mantiene updated_at al día en cada modificación
create function public.taskflow_set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create trigger taskflow_tasks_set_updated_at
  before update on public.taskflow_tasks
  for each row execute function public.taskflow_set_updated_at();


-- ---------- 3. Seguridad por fila (RLS) ----------
alter table public.taskflow_profiles enable row level security;
alter table public.taskflow_tasks enable row level security;

create policy "Cada usuario ve su perfil"
  on public.taskflow_profiles for select to authenticated
  using ((select auth.uid()) = id);

create policy "Cada usuario actualiza su perfil"
  on public.taskflow_profiles for update to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

create policy "Cada usuario ve sus tareas"
  on public.taskflow_tasks for select to authenticated
  using ((select auth.uid()) = user_id);

create policy "Cada usuario crea sus tareas"
  on public.taskflow_tasks for insert to authenticated
  with check ((select auth.uid()) = user_id);

create policy "Cada usuario actualiza sus tareas"
  on public.taskflow_tasks for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "Cada usuario elimina sus tareas"
  on public.taskflow_tasks for delete to authenticated
  using ((select auth.uid()) = user_id);


-- ---------- 4. Alta de usuario: perfil + tareas de bienvenida ----------
create function public.taskflow_handle_new_user()
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

  -- Tareas de ejemplo. Las fechas se calculan desde el día del registro.
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
    (new.id, 'Declaración bimestral de IVA', 'Revisar IVA generado y descontable antes de presentar.', current_date - 6, 'monthly', true, 10),
    (new.id, 'Cierre contable mensual', 'Registrar depreciaciones, provisiones y ajustes; generar estados financieros.', current_date + 12, 'monthly', false, 11),
    -- Anuales
    (new.id, 'Renovación de la matrícula mercantil', 'Renovar ante la Cámara de Comercio.', current_date - 200, 'yearly', true, 12),
    (new.id, 'Declaración de renta de la empresa', 'Preparar, presentar y pagar ante la DIAN.', current_date - 150, 'yearly', true, 13),
    (new.id, 'Información exógena (medios magnéticos)', 'Reportar a la DIAN los terceros y operaciones del año.', current_date - 120, 'yearly', false, 14),
    (new.id, 'Inventario físico de fin de año', 'Contar existencias y ajustar diferencias contra el sistema.', current_date + 70, 'yearly', false, 15),
    (new.id, 'Estados financieros de fin de año', 'Preparar balance, estado de resultados y notas para la asamblea.', current_date + 100, 'yearly', false, 16);

  return new;
end;
$$;

-- Solo el disparador debe ejecutar estas funciones, no los usuarios desde la API
revoke execute on function public.taskflow_handle_new_user() from public, anon, authenticated;
revoke execute on function public.taskflow_set_updated_at() from public, anon, authenticated;

create trigger taskflow_on_auth_user_created
  after insert on auth.users
  for each row execute function public.taskflow_handle_new_user();
