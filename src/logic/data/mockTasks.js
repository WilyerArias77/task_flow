// DATOS DE EJEMPLO (mock).
// Como todavía no hay backend ni base de datos, la app arranca con esta lista.
// Son procesos administrativos y contables típicos de una empresa,
// clasificados en tareas diarias, mensuales y anuales.
// Cada tarea tiene:
//   - id: identificador único
//   - title: el nombre de la tarea
//   - description: un detalle corto (opcional)
//   - dueDate: fecha límite "aaaa-mm-dd" (o null si no tiene)
//   - frequency: 'daily' (diaria), 'monthly' (mensual) o 'yearly' (anual)
//   - completed: true si ya está hecha, false si está pendiente
//
// Las fechas se calculan a partir de HOY (addDaysISO), para que el ejemplo
// siempre muestre tareas vencidas, próximas y cumplidas sin importar el día.
import { addDaysISO } from '../rules/dateRules.js';

export const mockTasks = [
  // ---------- Diarias ----------
  {
    id: 'task-1',
    title: 'Facturación electrónica de ventas del día',
    description: 'Emitir las facturas y enviarlas a los clientes.',
    dueDate: addDaysISO(0),
    frequency: 'daily',
    completed: true,
  },
  {
    id: 'task-2',
    title: 'Arqueo de caja',
    description: 'Contar el efectivo y cuadrarlo con los recibos del día.',
    dueDate: addDaysISO(-1),
    frequency: 'daily',
    completed: false,
  },
  {
    id: 'task-3',
    title: 'Causación de facturas de proveedores',
    description: 'Registrar las facturas electrónicas recibidas.',
    dueDate: addDaysISO(1),
    frequency: 'daily',
    completed: false,
  },
  {
    id: 'task-4',
    title: 'Seguimiento de cartera vencida',
    description: 'Contactar a los clientes con facturas de más de 60 días.',
    dueDate: addDaysISO(2),
    frequency: 'daily',
    completed: false,
  },
  {
    id: 'task-5',
    title: 'Programar pagos a proveedores',
    description: 'Preparar el lote de pagos según vencimientos.',
    dueDate: addDaysISO(-2),
    frequency: 'daily',
    completed: false,
  },

  // ---------- Mensuales ----------
  {
    id: 'task-6',
    title: 'Conciliación bancaria del mes',
    description: 'Comparar los extractos bancarios con el libro auxiliar de bancos.',
    dueDate: addDaysISO(-4),
    frequency: 'monthly',
    completed: false,
  },
  {
    id: 'task-7',
    title: 'Liquidar nómina de la quincena',
    description: 'Incluir horas extra, novedades, incapacidades y deducciones.',
    dueDate: addDaysISO(11),
    frequency: 'monthly',
    completed: false,
  },
  {
    id: 'task-8',
    title: 'Pago de seguridad social (PILA)',
    description: 'Validar aportes de salud, pensión, ARL y parafiscales.',
    dueDate: addDaysISO(3),
    frequency: 'monthly',
    completed: false,
  },
  {
    id: 'task-9',
    title: 'Declaración de retención en la fuente',
    description: 'Presentar y pagar ante la DIAN antes del vencimiento.',
    dueDate: addDaysISO(5),
    frequency: 'monthly',
    completed: false,
  },
  {
    id: 'task-10',
    title: 'Declaración bimestral de IVA',
    description: 'Revisar IVA generado y descontable antes de presentar.',
    dueDate: addDaysISO(-6),
    frequency: 'monthly',
    completed: true,
  },
  {
    id: 'task-11',
    title: 'Cierre contable mensual',
    description: 'Registrar depreciaciones, provisiones y ajustes; generar estados financieros.',
    dueDate: addDaysISO(12),
    frequency: 'monthly',
    completed: false,
  },

  // ---------- Anuales ----------
  {
    id: 'task-12',
    title: 'Renovación de la matrícula mercantil',
    description: 'Renovar ante la Cámara de Comercio.',
    dueDate: addDaysISO(-200),
    frequency: 'yearly',
    completed: true,
  },
  {
    id: 'task-13',
    title: 'Declaración de renta de la empresa',
    description: 'Preparar, presentar y pagar ante la DIAN.',
    dueDate: addDaysISO(-150),
    frequency: 'yearly',
    completed: true,
  },
  {
    id: 'task-14',
    title: 'Información exógena (medios magnéticos)',
    description: 'Reportar a la DIAN los terceros y operaciones del año.',
    dueDate: addDaysISO(-120),
    frequency: 'yearly',
    completed: false,
  },
  {
    id: 'task-15',
    title: 'Inventario físico de fin de año',
    description: 'Contar existencias y ajustar diferencias contra el sistema.',
    dueDate: addDaysISO(70),
    frequency: 'yearly',
    completed: false,
  },
  {
    id: 'task-16',
    title: 'Estados financieros de fin de año',
    description: 'Preparar balance, estado de resultados y notas para la asamblea.',
    dueDate: addDaysISO(100),
    frequency: 'yearly',
    completed: false,
  },
];
