// AVISO DE ERROR (por ejemplo, si no se pudo guardar un cambio).
// Componente 100% visual: muestra el mensaje y un botón para cerrarlo.
export default function ErrorBanner({ message, onClose }) {
  return (
    <div className="error-banner" role="alert">
      <p>{message}</p>
      <button className="error-banner__close" type="button" onClick={onClose} aria-label="Cerrar aviso">
        ×
      </button>
    </div>
  );
}
