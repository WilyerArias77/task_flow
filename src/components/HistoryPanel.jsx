// HISTORIAL DE CUMPLIMIENTO de la lista que se está viendo.
// Se abre y cierra con un clic (elemento <details> del navegador).
// Cada fila muestra cuándo se cumplió la tarea, para qué fecha era y si
// fue a tiempo o con retraso (eso lo decide la lógica: isCompletedOnTime).
import { isoToDisplay, timestampToISODate } from '../logic/rules/dateRules.js';

export default function HistoryPanel({ items }) {
  return (
    <details className="history">
      <summary className="history__summary">
        Historial de cumplimiento
        <span className="history__count">{items.length}</span>
      </summary>

      {items.length === 0 ? (
        <p className="history__empty">
          Aún no hay tareas cumplidas en esta lista. Cuando marques una, aparecerá aquí.
        </p>
      ) : (
        <ul className="history__list">
          {items.map((item) => (
            <li key={item.id} className="history__item">
              <span className="history__date">
                {isoToDisplay(timestampToISODate(item.completedAt))}
              </span>
              <span className="history__title">
                {item.taskTitle}
                {item.dueDate && (
                  <span className="history__due">Fecha límite: {isoToDisplay(item.dueDate)}</span>
                )}
              </span>
              <span className={`history__tag ${item.onTime ? 'history__tag--ok' : 'history__tag--late'}`}>
                {item.onTime ? 'A tiempo' : 'Con retraso'}
              </span>
            </li>
          ))}
        </ul>
      )}
    </details>
  );
}
