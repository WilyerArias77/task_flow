// ENCABEZADO de la app: logo de Growing Solutions y nombre. Componente 100% visual.
import logo from '../assets/logo-growing-solutions.png';

export default function Header() {
  return (
    <header className="header">
      <div className="header__inner">
        <img className="header__logo" src={logo} alt="Growing Solutions" />
        <span className="header__divider" aria-hidden="true" />
        <div>
          <h1 className="header__title">TaskFlow</h1>
          <span className="header__tagline">Procesos administrativos y contables en orden</span>
        </div>
      </div>
    </header>
  );
}
