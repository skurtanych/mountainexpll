import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import MountainModal from './MountainModal'
import { mountain, t } from '../testData'

const user = { id: 1, name: 'Traveler' }

function setup(props = {}) {
  const onBook = vi.fn()
  const onClose = vi.fn()
  render(
    <MountainModal
      mountain={mountain}
      language="ua"
      t={t}
      user={user}
      onBook={onBook}
      onClose={onClose}
      {...props}
    />,
  )
  return { onBook, onClose }
}

function isoInDays(days) {
  const d = new Date()
  d.setDate(d.getDate() + days)
  return d.toISOString().slice(0, 10)
}

describe('MountainModal', () => {
  it('renders nothing when mountain is null', () => {
    const { container } = render(
      <MountainModal mountain={null} language="ua" t={t} onBook={vi.fn()} onClose={vi.fn()} />,
    )
    expect(container).toBeEmptyDOMElement()
  })

  it('renders mountain details in ukrainian', () => {
    setup()
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Говерла' })).toBeInTheDocument()
    expect(screen.getByText('Найвища вершина України.')).toBeInTheDocument()
    expect(screen.getByText('2 061 м')).toBeInTheDocument()
    expect(screen.getByText('Івано-Франківська область')).toBeInTheDocument()
    expect(screen.getByText('Середня')).toBeInTheDocument()
    expect(screen.getByText('Травень — жовтень')).toBeInTheDocument()
  })

  it('renders details in english', () => {
    setup({ language: 'en' })
    expect(screen.getByRole('heading', { name: 'Hoverla' })).toBeInTheDocument()
    expect(screen.getByText('Ivano-Frankivsk Oblast')).toBeInTheDocument()
  })

  it('shows date picker with default date (+14 days) and min date (+1 day) for a logged-in user', () => {
    setup()
    const input = screen.getByLabelText(t.departure)
    expect(input).toHaveValue(isoInDays(14))
    expect(input).toHaveAttribute('min', isoInDays(1))
    expect(screen.getByRole('button', { name: new RegExp(t.book) })).toBeEnabled()
    expect(screen.queryByText(t.demoNote)).not.toBeInTheDocument()
  })

  it('hides date picker and shows login prompt for a guest', () => {
    setup({ user: null })
    expect(screen.queryByLabelText(t.departure)).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: new RegExp(t.loginToBook) })).toBeEnabled()
    expect(screen.getByText(t.demoNote)).toBeInTheDocument()
  })

  it('calls onBook with mountain and selected date', async () => {
    const { onBook } = setup()
    const date = isoInDays(30)
    fireEvent.change(screen.getByLabelText(t.departure), { target: { value: date } })
    await userEvent.click(screen.getByRole('button', { name: new RegExp(t.book) }))
    expect(onBook).toHaveBeenCalledWith(mountain, date)
  })

  it('disables booking when the date is in the past', () => {
    setup()
    fireEvent.change(screen.getByLabelText(t.departure), { target: { value: isoInDays(-5) } })
    expect(screen.getByRole('button', { name: new RegExp(t.book) })).toBeDisabled()
  })

  it('disables booking when the date is empty', () => {
    setup()
    fireEvent.change(screen.getByLabelText(t.departure), { target: { value: '' } })
    expect(screen.getByRole('button', { name: new RegExp(t.book) })).toBeDisabled()
  })

  it('shows an error alert when error is passed', () => {
    setup({ error: 'Ви вже забронювали цю гору' })
    expect(screen.getByRole('alert')).toHaveTextContent('Ви вже забронювали цю гору')
  })

  it('does not show an alert without an error', () => {
    setup()
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })

  it('calls onClose when the close button is clicked', async () => {
    const { onClose } = setup()
    await userEvent.click(screen.getByRole('button', { name: t.close }))
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('calls onClose when clicking on the backdrop but not inside the dialog', () => {
    const { onClose } = setup()
    fireEvent.mouseDown(screen.getByRole('dialog'))
    expect(onClose).not.toHaveBeenCalled()
    fireEvent.mouseDown(screen.getByRole('presentation'))
    expect(onClose).toHaveBeenCalledTimes(1)
  })
})
