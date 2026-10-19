// GRÁFICO DE CUMPLIMIENTO DEL PERIODO.
// Mide el periodo actual de cada lista: hoy (diarias), este mes (mensuales)
// y este año (anuales). Muestra tres cosas:
//   1. El % de cumplimiento de la lista que se está viendo (número grande).
//   2. Una barra dividida en cumplidas / pendientes a tiempo / vencidas.
//   3. Una comparación del % de cumplimiento de diarias, mensuales y anuales.
// Los números ya llegan calculados desde la lógica (chartRules / taskRules).
// El tamaño de cada barra se pasa como dato (--value) y el CSS lo dibuja.
import { getChartSegments } from '../logic/rules/chartRules.js';

export default function ComplianceChart({ frequency, stats, statsByFrequency }) {
  const segments = getChartSegments(stats);

  return (
    <section className="stats" aria-label="Cumplimiento de tareas">
      <div className="stats__summary">
        <p className="stats__label">Cumplimiento {frequency.periodLabel}</p>
        <p className="stats__value">{stats.rate}%</p>
        <p className="stats__detail">
          {stats.completed} de {stats.total} tareas cumplidas
        </p>
      </div>

      <div className="stats__breakdown">
        {stats.total === 0 ? (
          <p className="stats__empty">No hay tareas para {frequency.periodLabel}.</p>
        ) : (
          <div className="stacked-bar" role="img" aria-label={segments.map((s) => `${s.label}: ${s.value}`).join(', ')}>
            {segments
              .filter((segment) => segment.value > 0)
              .map((segment) => (
                <div
                  key={segment.id}
                  className={`stacked-bar__segment stacked-bar__segment--${segment.id}`}
                  style={{ '--value': segment.value }}
                  data-tooltip={`${segment.label}: ${segment.value} (${segment.percent}%)`}
                />
              ))}
          </div>
        )}
        <ul className="legend">
          {segments.map((segment) => (
            <li key={segment.id} className="legend__item">
              <span className={`legend__swatch legend__swatch--${segment.id}`} aria-hidden="true" />
              {segment.label}
              <strong className="legend__value">{segment.value}</strong>
            </li>
          ))}
        </ul>
      </div>

      <div className="stats__compare">
        <p className="stats__label">Cumplimiento por tipo</p>
        <ul className="compare">
          {statsByFrequency.map((item) => (
            <li key={item.id} className="compare__row">
              <span className="compare__name">
                {item.shortLabel}
                <span className="compare__period">{item.periodLabel}</span>
              </span>
              <span className="compare__track">
                <span
                  className="compare__fill"
                  style={{ '--value': item.rate }}
                  data-tooltip={`${item.completed} de ${item.total} cumplidas`}
                />
              </span>
              <span className="compare__value">{item.rate}%</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
