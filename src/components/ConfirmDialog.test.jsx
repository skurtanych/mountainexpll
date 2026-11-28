import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import ConfirmDialog from './ConfirmDialog'

function setup(props = {}) {
  const onConfirm = vi.fn()
  const onCancel = vi.fn()
  render(
    <ConfirmDialog
      title="Скасувати бронювання?"
      message="Заявку на Говерла буде видалено."
      confirmLabel="Так, скасувати"
      cancelLabel="Залишити"
      onConfirm={onConfirm}
      onCancel={onCancel}
      {...props}
    />,
  )
  return { onConfirm, onCancel }
}

describe('ConfirmDialog', () => {
  it('renders title, message and buttons with accessible attributes', () => {
    setup()
    const dialog = screen.getByRole('alertdialog')
    expect(dialog).toHaveAccessibleName('Скасувати бронювання?')
    expect(dialog).toHaveAccessibleDescription('Заявку на Говерла буде видалено.')
    expect(screen.getByRole('button', { name: 'Так, скасувати' })).toBeEnabled()
    expect(screen.getByRole('button', { name: 'Залишити' })).toBeEnabled()
  })

  it('calls onConfirm on confirm click', async () => {
    const { onConfirm, onCancel } = setup()
    await userEvent.click(screen.getByRole('button', { name: 'Так, скасувати' }))
    expect(onConfirm).toHaveBeenCalledTimes(1)
    expect(onCancel).not.toHaveBeenCalled()
  })

  it('calls onCancel on cancel click', async () => {
    const { onConfirm, onCancel } = setup()
    await userEvent.click(screen.getByRole('button', { name: 'Залишити' }))
    expect(onCancel).toHaveBeenCalledTimes(1)
    expect(onConfirm).not.toHaveBeenCalled()
  })

  it('calls onCancel on Escape and ignores other keys', () => {
    const { onCancel } = setup()
    fireEvent.keyDown(window, { key: 'Enter' })
    expect(onCancel).not.toHaveBeenCalled()
    fireEvent.keyDown(window, { key: 'Escape' })
    expect(onCancel).toHaveBeenCalledTimes(1)
  })

  it('calls onCancel on backdrop click but not on dialog click', () => {
    const { onCancel } = setup()
    fireEvent.mouseDown(screen.getByRole('alertdialog'))
    expect(onCancel).not.toHaveBeenCalled()
    fireEvent.mouseDown(screen.getByRole('presentation'))
    expect(onCancel).toHaveBeenCalledTimes(1)
  })

  it('disables both buttons while busy', () => {
    setup({ busy: true })
    expect(screen.getByRole('button', { name: 'Так, скасувати' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Залишити' })).toBeDisabled()
  })

  it('removes the Escape listener on unmount', () => {
    const onCancel = vi.fn()
    const { unmount } = render(
      <ConfirmDialog
        title="t"
        message="m"
        confirmLabel="ok"
        cancelLabel="no"
        onConfirm={vi.fn()}
        onCancel={onCancel}
      />,
    )
    unmount()
    fireEvent.keyDown(window, { key: 'Escape' })
    expect(onCancel).not.toHaveBeenCalled()
  })
})
