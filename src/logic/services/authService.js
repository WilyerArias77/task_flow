// SERVICIO DE CUENTAS (login, registro, contraseña).
// Es el único lugar de la app que habla con Supabase Auth.
// Si algún día se cambia de proveedor, solo se modifica este archivo.
import { supabase } from './supabaseClient.js';

// A dónde vuelve el usuario después de confirmar su correo o
// de pedir un cambio de contraseña: la misma dirección de la app.
const appUrl = () => window.location.origin;

export async function getSession() {
  const { data, error } = await supabase.auth.getSession();
  if (error) throw error;
  return data.session;
}

// Escucha cambios de sesión (entró, salió, abrió el enlace de nueva contraseña)
export function onAuthChange(callback) {
  const { data } = supabase.auth.onAuthStateChange((event, session) => callback(event, session));
  return () => data.subscription.unsubscribe();
}

// captchaToken: token de Cloudflare Turnstile (lo verifica Supabase)
export async function signUp({ email, password, fullName, company, marketingConsent, captchaToken }) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: appUrl(),
      captchaToken,
      // Estos datos los usa la base de datos para crear el perfil
      data: { full_name: fullName, company, marketing_consent: marketingConsent },
    },
  });
  if (error) throw error;
  return data;
}

export async function signIn({ email, password, captchaToken }) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
    options: { captchaToken },
  });
  if (error) throw error;
  return data;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function requestPasswordReset(email, captchaToken) {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: appUrl(),
    captchaToken,
  });
  if (error) throw error;
}

// Borra la cuenta del usuario y todos sus datos (función segura en la base
// de datos). Después cierra la sesión solo en este navegador, porque la
// cuenta ya no existe en el servidor.
export async function deleteMyAccount() {
  const { error } = await supabase.rpc('taskflow_delete_my_account');
  if (error) throw error;
  await supabase.auth.signOut({ scope: 'local' });
}

export async function updatePassword(password) {
  const { error } = await supabase.auth.updateUser({ password });
  if (error) throw error;
}
