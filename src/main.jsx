// Punto de arranque de React.
// 1) Carga TODOS los estilos de la app (una sola vez, desde la carpeta styles).
// 2) Monta el componente <App /> dentro del <div id="root"> de index.html.
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import './styles/index.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
);
