# TaskFlow

Gestor de tareas simple para freelancers y equipos pequeños.
Esta es la **versión punto cero**: el punto de partida del proyecto.

## ¿Qué hace hoy?

- Muestra procesos administrativos y contables de ejemplo (datos mock, sin base de datos).
- Selector de listas: **Mis tareas diarias**, **mensuales** y **anuales**.
- Cada tarea tiene una **fecha límite** en formato `dd-mm-aaaa` (se escribe o se elige en un calendario).
- Si la fecha ya llegó y la tarea sigue pendiente, **todo su texto se pone en rojo** y aparece la etiqueta "Vencida".
  Al marcarla como cumplida, el texto vuelve a negro.
- Permite crear, **editar** (título, descripción, fecha y lista) y **eliminar** tareas (una o varias a la vez).
- Permite marcar tareas como completadas con una casilla.
- Permite **arrastrar y soltar** tarjetas (desde el ícono de puntos) entre "Pendientes" y "Completadas",
  y reordenarlas dentro de una misma columna.
- **Tareas recurrentes (↻)**: al cumplirse, la tarea queda en "Completadas" hasta que pasa su fecha;
  luego vuelve sola a "Pendientes" con la fecha del siguiente día, mes o año. Se puede desactivar en "Editar".
- **Gráfico de cumplimiento por periodo**: hoy (diarias), este mes (mensuales) y este año (anuales), con
  desglose cumplidas / pendientes / vencidas y comparación entre las tres listas.
- **Historial de cumplimiento**: cada vez que se cumple una tarea queda registrado, con aviso
  "A tiempo" o "Con retraso".
- **Mi cuenta**: datos del usuario y opción de **eliminar la cuenta** con todos sus datos (Ley 1581).

- **Cuentas de usuario** (correo y contraseña) con Supabase Auth: registro con aceptación de la
  política de datos, inicio de sesión, recuperación de contraseña y cierre de sesión.
- Las tareas se **guardan en la base de datos** (Supabase). Cada usuario solo ve las suyas.
  Al registrarse recibe 16 tareas de ejemplo.

## Cómo ejecutarla

Necesitas tener [Node.js](https://nodejs.org) instalado (versión 20 o superior).

1. **Base de datos (una sola vez):** en tu proyecto de Supabase, abre *SQL Editor* y ejecuta, en orden,
   los archivos de `supabase/migrations/`:
   - `20261019000000_taskflow_schema.sql`: perfiles y tareas con seguridad por fila (RLS).
   - `20261019010000_recurrencia_historial_cuenta_panel.sql`: tareas recurrentes, historial,
     eliminar cuenta y panel de uso.
2. **Direcciones permitidas:** en *Authentication → URL Configuration → Redirect URLs* agrega la
   dirección de la app (en desarrollo: `http://localhost:5173`).
3. **Configuración local:** copia `.env.example` como `.env.local` y completa la *Project URL* y la
   *Publishable key* (Project Settings → API Keys). Nunca uses la clave secreta.
4. Instala y arranca:

```bash
npm install      # instala las dependencias (solo la primera vez)
npm run dev      # inicia la app en modo desarrollo
```

Luego abre en el navegador la dirección que aparece en la terminal
(normalmente http://localhost:5173).

Otros comandos:

```bash
npm run build    # genera la versión final en la carpeta dist/
npm run preview  # muestra localmente la versión final
```

## Panel de uso (solo administrador)

En Supabase → *SQL Editor* (no se publica en la API, nadie más puede verlo):

```sql
select * from taskflow_admin.resumen;   -- usuarios, activos 7/30 días, consentimientos
select * from taskflow_admin.usuarios;  -- detalle por usuario: tareas, cumplidas, última actividad
```

## Tecnologías

- **React**: construye la interfaz a partir de componentes.
- **Vite**: levanta el servidor de desarrollo y empaqueta la app.
- **CSS puro** con variables: estilos simples, sin librerías extra.
- **Drag and drop nativo de HTML5**: sin dependencias adicionales.

## Estructura del proyecto

```
src/
├── main.jsx            Arranque: carga estilos y monta la app
├── App.jsx             Componente raíz: elige qué página mostrar
├── pages/              Pantallas: conectan la lógica con los componentes
├── components/         Piezas visuales (sin reglas de negocio)
├── logic/              TODA la lógica de la app
│   ├── services/       Conexión con Supabase (cuentas y tareas)
│   ├── rules/          Reglas de negocio (tareas, fechas, gráfico, cuentas)
│   └── hooks/          Estado y comportamiento (tareas, formularios, fechas,
│                       modos editar/eliminar, arrastre)
├── styles/             TODOS los estilos de la app
└── assets/             Imágenes e íconos
```

## Reglas de arquitectura (no romperlas)

1. **Lógica y estilos nunca se mezclan en un mismo archivo.**
2. Los **componentes** solo muestran cosas y avisan cuando el usuario hace algo.
3. Las **reglas de negocio** viven en `src/logic/rules/`.
4. El **estado** vive en hooks dentro de `src/logic/hooks/`.
5. Los **estilos** viven en `src/styles/`. Para cambiar colores o tamaños,
   empieza por `theme.css`.

## Próximos pasos posibles

- Guardar las tareas en el navegador (localStorage) o en un backend.
- Editar y eliminar tareas.
- Usuarios y equipos.
