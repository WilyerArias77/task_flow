// CAMPO DE FECHA en formato "dd-mm-aaaa".
// Tiene un cuadro de texto para escribir la fecha y un botón con un
// calendario para elegirla. Toda la validación vive en useDateField.
import { useDateField } from '../logic/hooks/useDateField.js';

export default function DateField({ value, onChange, label }) {
  const field = useDateField(value, onChange);

  return (
    <div className={`date-field ${field.invalid ? 'date-field--invalid' : ''}`}>
      <input
        className="date-field__input"
        type="text"
        inputMode="numeric"
        placeholder="dd-mm-aaaa"
        maxLength={10}
        value={field.text}
        onChange={field.handleTextChange}
        onBlur={field.handleBlur}
        aria-label={label}
        aria-invalid={field.invalid}
      />
      <button
        className="date-field__button"
        type="button"
        onClick={field.openPicker}
        aria-label="Abrir calendario"
      >
        <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
          <rect x="3" y="5" width="18" height="16" rx="2" fill="none" stroke="currentColor" strokeWidth="2" />
          <path d="M3 10h18M8 3v4M16 3v4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </button>
      <input
        ref={field.pickerRef}
        className="date-field__picker"
        type="date"
        value={field.pickerValue}
        onChange={field.handlePickerChange}
        tabIndex={-1}
        aria-hidden="true"
      />
    </div>
  );
}
