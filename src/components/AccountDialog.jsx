// VENTANA "MI CUENTA".
// Muestra los datos del usuario, un enlace a la política de datos y la
// opción de eliminar la cuenta (con confirmación escribiendo ELIMINAR).
// Toda la lógica vive en el hook useAccount.
import { DELETE_CONFIRMATION_WORD } from '../logic/hooks/useAccount.js';
import { DATA_POLICY_URL } from '../logic/rules/authRules.js';

export default function AccountDialog({ account, userName, email }) {
  return (
    <div className="dialog-backdrop" onClick={account.close}>
      <div
        className="dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="account-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="dialog__header">
          <h2 id="account-title" className="dialog__title">Mi cuenta</h2>
          <button className="dialog__close" type="button" onClick={account.close} aria-label="Cerrar">
            ×
          </button>
        </div>

        <dl className="dialog__data">
          <dt>Nombre</dt>
          <dd>{userName}</dd>
          <dt>Correo</dt>
          <dd>{email}</dd>
        </dl>
        <p className="dialog__note">
          Tus datos se tratan según la{' '}
          <a href={DATA_POLICY_URL} target="_blank" rel="noreferrer">
            política de tratamiento de datos
          </a>{' '}
          de Growing Solutions.
        </p>

        <section className="danger-zone">
          <h3 className="danger-zone__title">Eliminar mi cuenta</h3>
          <p className="danger-zone__text">
            Se borrarán tu cuenta, todas tus tareas y tu historial. Esta acción no se puede deshacer.
          </p>
          <label className="field">
            <span className="field__label">
              Escribe <strong>{DELETE_CONFIRMATION_WORD}</strong> para confirmar
            </span>
            <input
              className="field__input"
              value={account.confirmText}
              onChange={account.handleConfirmChange}
              autoComplete="off"
            />
          </label>
          {account.error && <p className="auth__message auth__message--error" role="alert">{account.error}</p>}
          <button
            className="button button--danger danger-zone__button"
            type="button"
            onClick={account.deleteAccount}
            disabled={!account.canDelete}
          >
            {account.deleting ? 'Eliminando…' : 'Eliminar mi cuenta definitivamente'}
          </button>
        </section>
      </div>
    </div>
  );
}
