// Componente raíz. Su único trabajo es decidir qué página mostrar.
// Hoy solo existe una página (HomePage). En el futuro, aquí se agregaría
// un sistema de rutas para tener varias pantallas.
import Layout from './components/Layout.jsx';
import HomePage from './pages/HomePage.jsx';

export default function App() {
  return (
    <Layout>
      <HomePage />
    </Layout>
  );
}
