// REGLAS DEL GRÁFICO de cumplimiento.
// Convierte las estadísticas en "segmentos" listos para dibujar:
// cada segmento sabe su nombre, su cantidad y qué porcentaje representa.
// El componente del gráfico solo los pinta; no hace cuentas.

export const CHART_SEGMENTS = [
  { id: 'completed', label: 'Cumplidas' },
  { id: 'pending', label: 'Pendientes a tiempo' },
  { id: 'overdue', label: 'Vencidas' },
];

export function getChartSegments(stats) {
  return CHART_SEGMENTS.map((segment) => {
    const value = stats[segment.id];
    return {
      ...segment,
      value,
      percent: stats.total === 0 ? 0 : Math.round((value / stats.total) * 100),
    };
  });
}
