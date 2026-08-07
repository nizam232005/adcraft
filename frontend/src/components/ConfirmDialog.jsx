/**
 * ConfirmDialog — Modal confirmation dialog for destructive actions.
 */

export default function ConfirmDialog({ isOpen, title, message, onConfirm, onCancel, confirmLabel = 'Confirm', danger = false }) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-content animate-scale-in" onClick={(e) => e.stopPropagation()}>
        <h3 className="modal-title">{title || 'Are you sure?'}</h3>
        <p className="modal-text">{message || 'This action cannot be undone.'}</p>
        <div className="modal-actions">
          <button className="btn btn-secondary" onClick={onCancel}>
            Cancel
          </button>
          <button
            className={`btn ${danger ? 'btn-danger' : 'btn-primary'}`}
            onClick={onConfirm}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
