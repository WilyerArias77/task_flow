// SERVICIO DE CAPTCHA (Cloudflare Turnstile).
// Comprueba que quien se registra o inicia sesión es una persona y no un
// robot. Carga el script de Cloudflare una sola vez, y solo si la app tiene
// configurada la clave pública del sitio (VITE_TURNSTILE_SITE_KEY).
// La clave SECRETA de Turnstile no va en la app: vive en Supabase, que es
// quien verifica cada token.

const SCRIPT_URL = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';

export const captchaSiteKey = import.meta.env.VITE_TURNSTILE_SITE_KEY || '';
export const isCaptchaEnabled = Boolean(captchaSiteKey);

let loading = null;

export function loadTurnstile() {
  if (window.turnstile) return Promise.resolve(window.turnstile);
  if (!loading) {
    loading = new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = SCRIPT_URL;
      script.async = true;
      script.onload = () => resolve(window.turnstile);
      script.onerror = () => {
        loading = null;
        reject(new Error('No se pudo cargar la verificación de seguridad'));
      };
      document.head.appendChild(script);
    });
  }
  return loading;
}
