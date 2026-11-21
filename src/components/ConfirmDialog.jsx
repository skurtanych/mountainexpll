import { useEffect } from 'react'
import styles from './ConfirmDialog.module.css'
import { classNames } from '../classNames'

export default function ConfirmDialog({
  title,
  message,
  confirmLabel,
  cancelLabel,
  busy,
  onConfirm,
  onCancel,
}) {
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === 'Escape') onCancel()
    }
    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [onCancel])

  return (
    <div
      className={classNames(styles, 'confirm-backdrop')}
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onCancel()
      }}
    >
      <section
        className={classNames(styles, 'confirm-dialog')}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
        aria-describedby="confirm-message"
      >
        <h2 id="confirm-title">{title}</h2>
        <p id="confirm-message">{message}</p>
        <div className={classNames(styles, 'confirm-dialog__actions')}>
          <button
            className={classNames(styles, 'confirm-dialog__cancel')}
            type="button"
            onClick={onCancel}
            disabled={busy}
          >
            {cancelLabel}
          </button>
          <button
            className={classNames(styles, 'confirm-dialog__confirm')}
            type="button"
            onClick={onConfirm}
            disabled={busy}
          >
            {confirmLabel}
          </button>
        </div>
      </section>
    </div>
  )
}
