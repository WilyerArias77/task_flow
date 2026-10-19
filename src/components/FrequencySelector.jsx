// SELECTOR DE LISTA: "Mis tareas diarias", "mensuales" o "anuales".
// Solo muestra las opciones y avisa cuál eligió el usuario.
export default function FrequencySelector({ options, selectedId, onSelect }) {
  return (
    <div className="selector" role="tablist" aria-label="Tipo de tareas">
      {options.map((option) => (
        <button
          key={option.id}
          type="button"
          role="tab"
          aria-selected={option.id === selectedId}
          className={`selector__option ${option.id === selectedId ? 'selector__option--active' : ''}`}
          onClick={() => onSelect(option.id)}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
