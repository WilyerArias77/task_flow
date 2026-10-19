// REGLAS DE CUENTAS: validación de formularios y mensajes de error en español.

export const PASSWORD_MIN_LENGTH = 8;

// Política de tratamiento de datos (Ley 1581 de 2012) de Growing Solutions
export const DATA_POLICY_URL = 'https://www.growingsolutions.online/politica-datos';

export function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

// Revisa los campos según la pantalla (login, registro, recuperar o nueva
// contraseña). Devuelve el primer problema encontrado, o null si todo está bien.
export function validateAuthForm(mode, fields) {
  if (mode !== 'reset' && !isValidEmail(fields.email)) {
    return 'Escribe un correo electrónico válido.';
  }
  if (mode === 'signup' && fields.fullName.trim().length === 0) {
    return 'Escribe tu nombre.';
  }
  if ((mode === 'signup' || mode === 'reset') && fields.password.length < PASSWORD_MIN_LENGTH) {
    return `La contraseña debe tener al menos ${PASSWORD_MIN_LENGTH} caracteres.`;
  }
  if (mode === 'login' && fields.password.length === 0) {
    return 'Escribe tu contraseña.';
  }
  if (mode === 'signup' && !fields.acceptPolicy) {
    return 'Para crear tu cuenta debes aceptar la política de tratamiento de datos.';
  }
  return null;
}

// Traduce los errores de Supabase a mensajes claros para el usuario
const ERROR_MESSAGES = {
  invalid_credentials: 'Correo o contraseña incorrectos.',
  email_not_confirmed: 'Primero confirma tu correo: revisa tu bandeja de entrada.',
  user_already_exists: 'Ya existe una cuenta con este correo. Inicia sesión.',
  email_exists: 'Ya existe una cuenta con este correo. Inicia sesión.',
  weak_password: `La contraseña es muy débil. Usa al menos ${PASSWORD_MIN_LENGTH} caracteres.`,
  same_password: 'La nueva contraseña debe ser distinta a la anterior.',
  over_email_send_rate_limit: 'Se enviaron demasiados correos. Espera unos minutos e inténtalo de nuevo.',
  captcha_failed: 'La verificación de seguridad falló o expiró. Márcala de nuevo e inténtalo otra vez.',
  over_request_rate_limit: 'Demasiados intentos. Espera unos minutos e inténtalo de nuevo.',
};

// Lee la dirección con la que volvió el usuario desde un correo de Supabase:
//   ...#access_token=...&type=recovery      -> viene a crear una nueva contraseña
//   ...#error=...&error_code=otp_expired    -> el enlace expiró o ya se usó
export function parseAuthRedirect(hash) {
  const params = new URLSearchParams((hash || '').replace(/^#/, ''));
  const errorCode = params.get('error_code');
  let errorMessage = null;
  if (errorCode === 'otp_expired') {
    errorMessage = 'El enlace del correo expiró o ya fue usado. Pide uno nuevo con "¿Olvidaste tu contraseña?".';
  } else if (params.get('error')) {
    errorMessage = 'No se pudo validar el enlace del correo. Pide uno nuevo e inténtalo otra vez.';
  }
  return {
    isRecovery: params.get('type') === 'recovery' && params.has('access_token'),
    errorMessage,
  };
}

export function getAuthErrorMessage(error) {
  // El servidor no pudo enviar el correo (confirmación o recuperación)
  if (/error sending .* email/i.test(error?.message ?? '')) {
    return 'No pudimos enviarte el correo en este momento. Inténtalo de nuevo más tarde o escríbenos a wilyer.arias@growingsolutions.online.';
  }
  return ERROR_MESSAGES[error?.code] || 'Ocurrió un error. Inténtalo de nuevo en unos minutos.';
}
