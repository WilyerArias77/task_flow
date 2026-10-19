// BOTONES "Editar" y "Eliminar".
// Al hacer clic, la página entra en el modo correspondiente y las tareas
// se vuelven seleccionables. Este componente solo muestra los botones.
export default function TaskToolbar({ onEdit, onDelete }) {
  return (
    <div className="toolbar">
      <button className="button button--secondary" type="button" onClick={onEdit}>
        Editar
      </button>
      <button className="button button--danger-outline" type="button" onClick={onDelete}>
        Eliminar
      </button>
    </div>
  );
}
