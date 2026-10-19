// ENCABEZADO de la app: logo de Growing Solutions, nombre de la app
// y, a la derecha, el usuario conectado ("Mi cuenta") y su botón para salir.
// Componente 100% visual.
import logo from '../assets/logo-growing-solutions.png';

export default function Header({ userName, onOpenAccount, onSignOut }) {
  return (
    <header className="header">
      <div className="header__inner">
        <img className="header__logo" src={logo} alt="Growing Solutions" />
        <span className="header__divider" aria-hidden="true" />
        <div>
          <h1 className="header__title">TaskFlow</h1>
          <span className="header__tagline">Procesos administrativos y contables en orden</span>
        </div>
        {userName && (
          <div className="header__user">
            <button className="header__account" type="button" onClick={onOpenAccount} title="Mi cuenta">
              <span className="header__user-name">{userName}</span>
              <span className="header__account-label">Mi cuenta</span>
            </button>
            <button className="button button--secondary button--small" type="button" onClick={onSignOut}>
              Cerrar sesión
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
