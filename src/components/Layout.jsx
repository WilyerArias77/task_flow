// LAYOUT (estructura general de la pantalla).
// Es el "marco" que se repite en todas las páginas: encabezado arriba
// y el contenido de la página debajo. No contiene lógica.
import Header from './Header.jsx';

export default function Layout({ userName, onOpenAccount, onSignOut, children }) {
  return (
    <div className="layout">
      <Header userName={userName} onOpenAccount={onOpenAccount} onSignOut={onSignOut} />
      <main className="layout__content">{children}</main>
    </div>
  );
}
