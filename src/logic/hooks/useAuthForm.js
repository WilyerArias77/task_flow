// HOOK DEL FORMULARIO DE ACCESO.
// Una sola pantalla con cuatro modos:
//   - 'login':  iniciar sesión
//   - 'signup': crear cuenta (con aceptación de la política de datos)
//   - 'forgot': pedir el correo para restablecer la contraseña
//   - 'reset':  escribir la nueva contraseña (al volver desde ese correo)
// Guarda lo que se escribe, valida, llama al servicio y prepara los mensajes.
// En login, registro y recuperación exige la verificación anti-robots (captcha).
import { useState } from 'react';
import * as authService from '../services/authService.js';
import { useCaptcha } from './useCaptcha.js';
import { getAuthErrorMessage, validateAuthForm } from '../rules/authRules.js';

const EMPTY_FIELDS = {
  fullName: '',
  company: '',
  email: '',
  password: '',
  acceptPolicy: false,
  marketingConsent: false,
};

export function useAuthForm({ initialMode = 'login', onPasswordUpdated } = {}) {
  const [mode, setMode] = useState(initialMode);
  const [fields, setFields] = useState(EMPTY_FIELDS);
  const [error, setError] = useState(null);
  const [notice, setNotice] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const captcha = useCaptcha();
  const needsCaptcha = captcha.enabled && mode !== 'reset';

  const changeMode = (newMode) => {
    setMode(newMode);
    setError(null);
    setNotice(null);
    setFields((current) => ({ ...current, password: '' }));
  };

  // Sirve para campos de texto y casillas
  const handleChange = (event) => {
    const { name, type, checked, value } = event.target;
    setFields((current) => ({ ...current, [name]: type === 'checkbox' ? checked : value }));
  };

  const run = async () => {
    const email = fields.email.trim();
    const captchaToken = needsCaptcha ? captcha.token : undefined;

    if (mode === 'login') {
      await authService.signIn({ email, password: fields.password, captchaToken });
      return null; // al entrar, la app cambia sola al tablero
    }
    if (mode === 'signup') {
      const result = await authService.signUp({
        email,
        password: fields.password,
        fullName: fields.fullName.trim(),
        company: fields.company.trim(),
        marketingConsent: fields.marketingConsent,
        captchaToken,
      });
      // Si el proyecto pide confirmar el correo, todavía no hay sesión
      return result.session
        ? null
        : `Te enviamos un correo a ${email}. Ábrelo y confirma tu cuenta para empezar.`;
    }
    if (mode === 'forgot') {
      await authService.requestPasswordReset(email, captchaToken);
      return `Si existe una cuenta con ${email}, te llegará un correo para crear una nueva contraseña.`;
    }
    await authService.updatePassword(fields.password);
    onPasswordUpdated?.();
    return null;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setNotice(null);

    const problem = validateAuthForm(mode, fields);
    if (problem) {
      setError(problem);
      return;
    }
    if (needsCaptcha && !captcha.token) {
      setError('Completa la verificación de seguridad (la casilla de Cloudflare).');
      return;
    }

    setError(null);
    setSubmitting(true);
    try {
      const message = await run();
      if (message) {
        setNotice(message);
        setFields(EMPTY_FIELDS);
      }
    } catch (err) {
      setError(getAuthErrorMessage(err));
    } finally {
      setSubmitting(false);
      if (needsCaptcha) captcha.reset(); // cada verificación sirve una sola vez
    }
  };

  return {
    mode,
    fields,
    captcha,
    showCaptcha: needsCaptcha,
    error,
    notice,
    submitting,
    changeMode,
    handleChange,
    handleSubmit,
  };
}
