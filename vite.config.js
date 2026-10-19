// Configuración de Vite: la herramienta que levanta el servidor de desarrollo
// y empaqueta la app. El plugin de React le enseña a entender archivos .jsx.
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
});
