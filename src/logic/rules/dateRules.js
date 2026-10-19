// REGLAS DE FECHAS.
// Internamente las fechas se guardan como texto "aaaa-mm-dd" (formato ISO),
// que se puede comparar y ordenar fácilmente. Al usuario siempre se le
// muestran como "dd-mm-aaaa". Aquí están las conversiones entre ambos.

const pad = (number) => String(number).padStart(2, '0');

// Convierte un objeto Date de JavaScript a "aaaa-mm-dd".
export function toISODate(date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

// Fecha de hoy en formato "aaaa-mm-dd".
export function todayISO() {
  return toISODate(new Date());
}

// Fecha a N días de hoy (N negativo = días en el pasado).
export function addDaysISO(days, from = new Date()) {
  const date = new Date(from.getFullYear(), from.getMonth(), from.getDate() + days);
  return toISODate(date);
}

// "aaaa-mm-dd" -> "dd-mm-aaaa" (para mostrar).
export function isoToDisplay(iso) {
  if (!iso) return '';
  const [year, month, day] = iso.split('-');
  return `${day}-${month}-${year}`;
}

// "dd-mm-aaaa" -> "aaaa-mm-dd". Devuelve null si la fecha no existe
// (por ejemplo 31-02-2026) o si el texto no tiene el formato correcto.
export function displayToISO(text) {
  const match = /^(\d{2})-(\d{2})-(\d{4})$/.exec(text);
  if (!match) return null;

  const [, day, month, year] = match;
  if (Number(year) < 1900) return null;

  const date = new Date(Number(year), Number(month) - 1, Number(day));
  const exists =
    date.getFullYear() === Number(year) &&
    date.getMonth() === Number(month) - 1 &&
    date.getDate() === Number(day);

  return exists ? `${year}-${month}-${day}` : null;
}

// Mientras el usuario escribe, deja solo números y agrega los guiones solos.
// Ejemplo: "15032026" -> "15-03-2026".
export function maskDateText(text) {
  const digits = text.replace(/\D/g, '').slice(0, 8);
  if (digits.length > 4) return `${digits.slice(0, 2)}-${digits.slice(2, 4)}-${digits.slice(4)}`;
  if (digits.length > 2) return `${digits.slice(0, 2)}-${digits.slice(2)}`;
  return digits;
}

// Regla: una fecha "se cumple" cuando llega el día (hoy) o ya pasó.
export function isDateReached(iso, today = todayISO()) {
  return Boolean(iso) && iso <= today;
}

// Fecha (día local "aaaa-mm-dd") de un momento guardado con hora,
// por ejemplo "2026-10-19T19:02:16Z" -> "2026-10-19" en la hora del usuario.
export function timestampToISODate(timestamp) {
  return toISODate(new Date(timestamp));
}

const daysInMonth = (year, monthIndex) => new Date(year, monthIndex + 1, 0).getDate();

// Avanza una fecha un periodo: un día, un mes o un año.
// Si el día no existe en el mes siguiente (ej: 31 de enero + 1 mes),
// se usa el último día de ese mes (28/29 de febrero).
export function addPeriodISO(iso, frequency) {
  const [year, month, day] = iso.split('-').map(Number);
  if (frequency === 'daily') return toISODate(new Date(year, month - 1, day + 1));

  const targetYear = frequency === 'yearly' ? year + 1 : year + Math.floor(month / 12);
  const targetMonth = frequency === 'yearly' ? month - 1 : month % 12;
  const targetDay = Math.min(day, daysInMonth(targetYear, targetMonth));
  return toISODate(new Date(targetYear, targetMonth, targetDay));
}

// Periodo actual de cada tipo de lista: hoy, este mes o este año.
export function getPeriodRange(frequency, today = todayISO()) {
  const [year, month] = today.split('-');
  if (frequency === 'daily') return { start: today, end: today };
  if (frequency === 'monthly') {
    const lastDay = daysInMonth(Number(year), Number(month) - 1);
    return { start: `${year}-${month}-01`, end: `${year}-${month}-${String(lastDay).padStart(2, '0')}` };
  }
  return { start: `${year}-01-01`, end: `${year}-12-31` };
}

export function isInRange(iso, range) {
  return Boolean(iso) && iso >= range.start && iso <= range.end;
}
