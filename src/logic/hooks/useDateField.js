// HOOK DEL CAMPO DE FECHA (formato "dd-mm-aaaa").
// El usuario puede escribir la fecha (los guiones se ponen solos) o
// elegirla en el calendario del navegador. Este hook:
//   - guarda el texto mientras se escribe,
//   - avisa (onChange) solo cuando hay una fecha completa y válida,
//   - marca el campo como inválido si la fecha no existe (ej: 31-02-2026),
//   - si el usuario sale del campo con algo incompleto, vuelve al valor anterior.
import { useEffect, useRef, useState } from 'react';
import { displayToISO, isoToDisplay, maskDateText } from '../rules/dateRules.js';

export function useDateField(value, onChange) {
  const [text, setText] = useState(isoToDisplay(value));
  const [invalid, setInvalid] = useState(false);
  const pickerRef = useRef(null);

  // Si la fecha cambia desde afuera (ej: desde el calendario), actualiza el texto
  useEffect(() => {
    setText(isoToDisplay(value));
    setInvalid(false);
  }, [value]);

  const handleTextChange = (event) => {
    const masked = maskDateText(event.target.value);
    setText(masked);

    if (masked.length < 10) {
      setInvalid(false);
      return;
    }
    const iso = displayToISO(masked);
    setInvalid(!iso);
    if (iso && iso !== value) onChange(iso);
  };

  const handleBlur = () => {
    if (text === '') {
      if (value) onChange(null); // el usuario borró la fecha
      return;
    }
    if (!displayToISO(text)) {
      setText(isoToDisplay(value));
      setInvalid(false);
    }
  };

  // Calendario nativo del navegador
  const handlePickerChange = (event) => onChange(event.target.value || null);

  const openPicker = () => {
    const picker = pickerRef.current;
    if (!picker) return;
    try {
      picker.showPicker();
    } catch {
      picker.focus();
    }
  };

  return {
    text,
    invalid,
    pickerRef,
    pickerValue: value || '',
    handleTextChange,
    handleBlur,
    handlePickerChange,
    openPicker,
  };
}
