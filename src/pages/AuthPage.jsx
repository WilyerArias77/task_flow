// PANTALLA DE ACCESO: iniciar sesión, crear cuenta y recuperar contraseña.
// Conecta el hook useAuthForm (lógica) con los campos del formulario (vista).
import { useAuthForm } from '../logic/hooks/useAuthForm.js';
import { DATA_POLICY_URL, PASSWORD_MIN_LENGTH } from '../logic/rules/authRules.js';
import logo from '../assets/logo-growing-solutions.png';

const TITLES = {
  login: 'Inicia sesión',
  signup: 'Crea tu cuenta gratis',
  forgot: 'Recupera tu contraseña',
  reset: 'Crea una nueva contraseña',
};

const BUTTONS = {
  login: 'Entrar',
  signup: 'Crear cuenta',
  forgot: 'Enviar correo',
  reset: 'Guardar contraseña',
};

export default function AuthPage({ initialMode, initialError, onPasswordUpdated }) {
  const form = useAuthForm({ initialMode, initialError, onPasswordUpdated });
  const { mode, fields } = form;

  return (
    <div className="auth">
      <div className="auth__card">
        <img className="auth__logo" src={logo} alt="Growing Solutions" />
        <p className="auth__product">TaskFlow</p>
        <h1 className="auth__title">{TITLES[mode]}</h1>
        {mode === 'signup' && (
          <p className="auth__subtitle">
            Organiza tus procesos administrativos y contables en un solo lugar.
          </p>
        )}

        <form className="auth__form" onSubmit={form.handleSubmit} noValidate>
          {mode === 'signup' && (
            <>
              <label className="field">
                <span className="field__label">Nombre</span>
                <input className="field__input" name="fullName" value={fields.fullName} onChange={form.handleChange} autoComplete="name" />
              </label>
              <label className="field">
                <span className="field__label">Empresa (opcional)</span>
                <input className="field__input" name="company" value={fields.company} onChange={form.handleChange} autoComplete="organization" />
              </label>
            </>
          )}

          {mode !== 'reset' && (
            <label className="field">
              <span className="field__label">Correo electrónico</span>
              <input className="field__input" type="email" name="email" value={fields.email} onChange={form.handleChange} autoComplete="email" />
            </label>
          )}

          {mode !== 'forgot' && (
            <label className="field">
              <span className="field__label">
                {mode === 'reset' ? 'Nueva contraseña' : 'Contraseña'}
              </span>
              <input
                className="field__input"
                type="password"
                name="password"
                value={fields.password}
                onChange={form.handleChange}
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              />
              {(mode === 'signup' || mode === 'reset') && (
                <span className="field__hint">Mínimo {PASSWORD_MIN_LENGTH} caracteres.</span>
              )}
            </label>
          )}

          {mode === 'login' && (
            <button className="auth__link auth__link--right" type="button" onClick={() => form.changeMode('forgot')}>
              ¿Olvidaste tu contraseña?
            </button>
          )}

          {mode === 'signup' && (
            <div className="auth__consents">
              <label className="consent">
                <input type="checkbox" name="acceptPolicy" checked={fields.acceptPolicy} onChange={form.handleChange} />
                <span>
                  Acepto la{' '}
                  <a href={DATA_POLICY_URL} target="_blank" rel="noreferrer">
                    política de tratamiento de datos personales
                  </a>{' '}
                  de Growing Solutions.
                </span>
              </label>
              <label className="consent">
                <input type="checkbox" name="marketingConsent" checked={fields.marketingConsent} onChange={form.handleChange} />
                <span>Quiero recibir novedades y consejos de Growing Solutions (opcional).</span>
              </label>
            </div>
          )}

          {form.captcha.enabled && (
            <div className={`auth__captcha ${form.showCaptcha ? '' : 'auth__captcha--hidden'}`}>
              <div ref={form.captcha.containerRef} />
              {form.captcha.loadError && (
                <p className="field__hint">
                  No se pudo cargar la verificación de seguridad. Revisa tu conexión y recarga la página.
                </p>
              )}
            </div>
          )}

          {form.error && <p className="auth__message auth__message--error" role="alert">{form.error}</p>}
          {form.notice && <p className="auth__message auth__message--notice" role="status">{form.notice}</p>}

          <button className="button auth__submit" type="submit" disabled={form.submitting}>
            {form.submitting ? 'Un momento…' : BUTTONS[mode]}
          </button>
        </form>

        <p className="auth__switch">
          {mode === 'login' && (
            <>
              ¿No tienes cuenta?{' '}
              <button className="auth__link" type="button" onClick={() => form.changeMode('signup')}>
                Regístrate gratis
              </button>
            </>
          )}
          {(mode === 'signup' || mode === 'forgot') && (
            <>
              {mode === 'signup' ? '¿Ya tienes cuenta? ' : ''}
              <button className="auth__link" type="button" onClick={() => form.changeMode('login')}>
                {mode === 'signup' ? 'Inicia sesión' : 'Volver a iniciar sesión'}
              </button>
            </>
          )}
        </p>
      </div>
    </div>
  );
}
