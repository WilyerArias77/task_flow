// HOOK DE SESIÓN.
// Sabe si hay un usuario conectado y quién es. Se mantiene al día solo:
// cuando el usuario entra, sale o abre el enlace para cambiar su contraseña.
//
// Si la app se abrió desde el correo "restablecer contraseña", lo detecta
// leyendo la dirección (no depende de que el aviso de Supabase llegue a
// tiempo). Si el enlace venía vencido, prepara un mensaje para mostrarlo.
import { useEffect, useState } from 'react';
import * as authService from '../services/authService.js';
import { initialUrlHash, isSupabaseConfigured } from '../services/supabaseClient.js';
import { parseAuthRedirect } from '../rules/authRules.js';

const redirect = parseAuthRedirect(initialUrlHash);

export function useAuth() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(isSupabaseConfigured);
  // true cuando el usuario llegó desde el correo "restablecer contraseña"
  const [isRecovering, setIsRecovering] = useState(redirect.isRecovery);
  const [redirectError, setRedirectError] = useState(redirect.errorMessage);

  useEffect(() => {
    if (!isSupabaseConfigured) return undefined;

    // Quita de la barra de direcciones el error del enlace (ya se leyó)
    if (redirect.errorMessage) {
      window.history.replaceState(null, '', window.location.pathname + window.location.search);
    }

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
    redirectError,
    clearRedirectError: () => setRedirectError(null),
    finishRecovery: () => setIsRecovering(false),
    signOut: authService.signOut,
  };
}
