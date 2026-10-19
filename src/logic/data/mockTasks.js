// DATOS DE EJEMPLO (mock).
// Como todavía no hay backend ni base de datos, la app arranca con esta lista.
// Son procesos administrativos y contables típicos de una empresa.
// Cada tarea tiene:
//   - id: identificador único
//   - title: el nombre de la tarea
//   - description: un detalle corto (opcional)
//   - completed: true si ya está hecha, false si está pendiente

export const mockTasks = [
  {
    id: 'task-1',
    title: 'Conciliación bancaria del mes',
    description: 'Comparar los extractos bancarios con el libro auxiliar de bancos.',
    completed: false,
  },
  {
    id: 'task-2',
    title: 'Facturación electrónica de servicios',
    description: 'Emitir las facturas del mes y enviarlas a los clientes.',
    completed: true,
  },
  {
    id: 'task-3',
    title: 'Liquidar nómina de la quincena',
    description: 'Incluir horas extra, novedades, incapacidades y deducciones.',
    completed: false,
  },
  {
    id: 'task-4',
    title: 'Pago de seguridad social (PILA)',
    description: 'Validar aportes de salud, pensión, ARL y parafiscales.',
    completed: false,
  },
  {
    id: 'task-5',
    title: 'Declaración de retención en la fuente',
    description: 'Presentar y pagar ante la DIAN antes del vencimiento.',
    completed: false,
  },
  {
    id: 'task-6',
    title: 'Arqueo y reembolso de caja menor',
    description: 'Revisar soportes y legalizar los gastos del periodo.',
    completed: true,
  },
  {
    id: 'task-7',
    title: 'Causación de facturas de proveedores',
    description: 'Registrar las facturas electrónicas recibidas en el mes.',
    completed: false,
  },
  {
    id: 'task-8',
    title: 'Seguimiento de cartera vencida',
    description: 'Contactar a los clientes con facturas de más de 60 días.',
    completed: false,
  },
  {
    id: 'task-9',
    title: 'Declaración bimestral de IVA',
    description: 'Revisar IVA generado y descontable antes de presentar.',
    completed: true,
  },
  {
    id: 'task-10',
    title: 'Programar pagos a proveedores',
    description: 'Preparar el lote de pagos de la semana según vencimientos.',
    completed: false,
  },
  {
    id: 'task-11',
    title: 'Cierre contable mensual',
    description: 'Registrar depreciaciones, provisiones y ajustes; generar estados financieros.',
    completed: false,
  },
];
