// HOOK DEL CAPTCHA.
// Dibuja la casilla de verificación de Cloudflare dentro de un contenedor
// y guarda el "token" que entrega cuando confirma que el usuario es una
// persona. Cada token sirve UNA sola vez: después de cada intento de login
// o registro hay que pedir uno nuevo (reset).
import { useEffect, useRef, useState } from 'react';
import { captchaSiteKey, isCaptchaEnabled, loadTurnstile } from '../services/captchaService.js';

export function useCaptcha() {
  const containerRef = useRef(null);
  const widgetIdRef = useRef(null);
  const [token, setToken] = useState(null);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    if (!isCaptchaEnabled) return undefined;
    let cancelled = false;

    loadTurnstile()
      .then((turnstile) => {
        if (cancelled || !containerRef.current) return;
        widgetIdRef.current = turnstile.render(containerRef.current, {
          sitekey: captchaSiteKey,
          language: 'es',
          callback: (newToken) => setToken(newToken),
          'expired-callback': () => setToken(null),
          'error-callback': () => setToken(null),
        });
      })
      .catch(() => setLoadError(true));

    return () => {
      cancelled = true;
      if (widgetIdRef.current !== null && window.turnstile) {
        window.turnstile.remove(widgetIdRef.current);
        widgetIdRef.current = null;
      }
    };
  }, []);

  // Pide un token nuevo (los tokens son de un solo uso)
  const reset = () => {
    setToken(null);
    if (widgetIdRef.current !== null && window.turnstile) {
      window.turnstile.reset(widgetIdRef.current);
    }
  };

  return {
    enabled: isCaptchaEnabled,
    containerRef,
    token,
    loadError,
    reset,
  };
}
