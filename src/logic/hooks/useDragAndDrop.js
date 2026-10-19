// HOOK DE DRAG AND DROP (arrastrar y soltar).
// Usa la función nativa del navegador (HTML5 Drag and Drop), sin librerías extra.
// Este hook entrega "props" listas para pegar en las tarjetas y columnas.
// Los componentes no saben CÓMO funciona el arrastre: solo reciben estas props.
//
// Flujo:
//   1. El usuario empieza a arrastrar una tarjeta  -> guardamos su id.
//   2. Pasa por encima de una columna               -> la marcamos como "destino".
//   3. Suelta sobre una tarjeta o sobre la columna  -> llamamos a onMove(...).
import { useState } from 'react';

export function useDragAndDrop(onMove) {
  const [draggingId, setDraggingId] = useState(null);
  const [overColumnId, setOverColumnId] = useState(null);

  const reset = () => {
    setDraggingId(null);
    setOverColumnId(null);
  };

  // Props para cada tarjeta: se puede arrastrar y también recibir otra encima.
  const getCardProps = (taskId, columnId) => ({
    draggable: true,
    onDragStart: (event) => {
      event.dataTransfer.setData('text/plain', taskId);
      event.dataTransfer.effectAllowed = 'move';
      setDraggingId(taskId);
    },
    onDragEnd: reset,
    onDragOver: (event) => event.preventDefault(), // permite soltar aquí
    onDrop: (event) => {
      event.preventDefault();
      event.stopPropagation(); // que la columna no procese el mismo evento
      const droppedId = event.dataTransfer.getData('text/plain');
      if (droppedId && droppedId !== taskId) onMove(droppedId, columnId, taskId);
      reset();
    },
  });

  // Props para cada columna: si se suelta en un espacio vacío, va al final.
  const getColumnProps = (columnId) => ({
    onDragOver: (event) => {
      event.preventDefault();
      if (overColumnId !== columnId) setOverColumnId(columnId);
    },
    onDragLeave: (event) => {
      // Solo se "sale" de la columna si el cursor no está sobre un hijo suyo
      if (!event.currentTarget.contains(event.relatedTarget)) setOverColumnId(null);
    },
    onDrop: (event) => {
      event.preventDefault();
      const droppedId = event.dataTransfer.getData('text/plain');
      if (droppedId) onMove(droppedId, columnId, null);
      reset();
    },
  });

  return {
    draggingId,
    overColumnId,
    getCardProps,
    getColumnProps,
  };
}
