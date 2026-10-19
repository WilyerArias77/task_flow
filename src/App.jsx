// Componente raíz. Decide qué pantalla mostrar:
//   - falta configurar Supabase      -> aviso de configuración
//   - revisando si hay sesión        -> pantalla de carga
//   - sin sesión o cambiando clave   -> pantalla de acceso (AuthPage)
//   - con sesión                     -> tablero de tareas (HomePage)
import { useAuth } from './logic/hooks/useAuth.js';
import { useAccount } from './logic/hooks/useAccount.js';
import Layout from './components/Layout.jsx';
import AccountDialog from './components/AccountDialog.jsx';
import StatusMessage from './components/StatusMessage.jsx';
import AuthPage from './pages/AuthPage.jsx';
import HomePage from './pages/HomePage.jsx';

export default function App() {
  const auth = useAuth();
  const account = useAccount();

  if (!auth.isConfigured) {
    return (
      <StatusMessage title="Falta conectar la base de datos">
        Crea el archivo <code>.env.local</code> a partir de <code>.env.example</code> con la
        dirección y la clave pública de tu proyecto de Supabase, y reinicia la app.
      </StatusMessage>
    );
  }

  if (auth.loading) return <StatusMessage title="Cargando TaskFlow…" />;

  if (!auth.user || auth.isRecovering) {
    return (
      <AuthPage
        initialMode={auth.isRecovering ? 'reset' : 'login'}
        onPasswordUpdated={auth.finishRecovery}
      />
    );
  }

  return (
    <Layout userName={auth.userName} onOpenAccount={account.open} onSignOut={auth.signOut}>
      <HomePage userId={auth.user.id} />
      {account.isOpen && (
        <AccountDialog account={account} userName={auth.userName} email={auth.user.email} />
      )}
    </Layout>
  );
}
