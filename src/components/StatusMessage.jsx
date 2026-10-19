// MENSAJE DE PANTALLA COMPLETA (cargando, falta configuración, etc.).
// Componente 100% visual: muestra el logo, un título y un texto opcional.
import logo from '../assets/logo-growing-solutions.png';

export default function StatusMessage({ title, children }) {
  return (
    <div className="status-screen">
      <img className="status-screen__logo" src={logo} alt="Growing Solutions" />
      <h1 className="status-screen__title">{title}</h1>
      {children && <p className="status-screen__text">{children}</p>}
    </div>
  );
}
