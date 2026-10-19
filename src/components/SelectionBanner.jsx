// AVISO DEL MODO ACTIVO ("Editar" o "Eliminar").
// Le explica al usuario qué hacer y le muestra los botones para
// confirmar o cancelar. Las acciones vienen del hook useSelectionMode.
export default function SelectionBanner({ selection }) {
  const isDelete = selection.mode === 'delete';

  return (
    <div className={`banner ${isDelete ? 'banner--delete' : 'banner--edit'}`} role="status">
      <p className="banner__text">
        {isDelete
          ? `Haz clic en las tareas que quieres eliminar · ${selection.selectedCount} seleccionada(s)`
          : 'Haz clic en la tarea que quieres editar'}
      </p>
      <div className="banner__actions">
        {isDelete && (
          <button
            className="button button--danger"
            type="button"
            onClick={selection.confirmDelete}
            disabled={selection.selectedCount === 0}
          >
            Eliminar seleccionadas ({selection.selectedCount})
          </button>
        )}
        <button className="button button--secondary" type="button" onClick={selection.cancel}>
          {isDelete ? 'Cancelar' : 'Terminar'}
        </button>
      </div>
    </div>
  );
}
