// HOOK DE SESIÓN.
// Sabe si hay un usuario conectado y quién es. Se mantiene al día solo:
// cuando el usuario entra, sale o abre el enlace para cambiar su contraseña.
import { useEffect, useState } from 'react';
import * as authService from '../services/authService.js';
import { isSupabaseConfigured } from '../services/supabaseClient.js';

export function useAuth() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(isSupabaseConfigured);
  // true cuando el usuario llegó desde el correo "restablecer contraseña"
  const [isRecovering, setIsRecovering] = useState(false);

  useEffect(() => {
    if (!isSupabaseConfigured) return undefined;

    authService
      .getSession()
      .then(setSession)
      .catch(() => setSession(null))
      .finally(() => setLoading(false));

    return authService.onAuthChange((event, newSession) => {
      setSession(newSession);
      if (event === 'PASSWORD_RECOVERY') setIsRecovering(true);
    });
  }, []);

  const user = session?.user ?? null;

  return {
    isConfigured: isSupabaseConfigured,
    loading,
    user,
    userName: user?.user_metadata?.full_name || user?.email || '',
    isRecovering,
    finishRecovery: () => setIsRecovering(false),
    signOut: authService.signOut,
  };
}
