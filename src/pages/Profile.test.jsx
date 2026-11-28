import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import Profile from './Profile'
import { useAuth } from '../hooks/useAuth'
import { useFetch } from '../hooks/useFetch'
import { useMutation } from '../hooks/useMutation'
import { mountains, t } from '../testData'

const navigate = vi.fn()

vi.mock('react-router', () => ({ useNavigate: () => navigate }))
vi.mock('../api/config', () => ({ API_URL: 'http://api' }))
vi.mock('../hooks/useAuth', () => ({ useAuth: vi.fn() }))
vi.mock('../hooks/useFetch', () => ({ useFetch: vi.fn() }))
vi.mock('../hooks/useMutation', () => ({ useMutation: vi.fn() }))

const bookings = [
  { id: 1, mountain: 'hoverla', date: '2026-12-04', status: 'pending' },
  { id: 2, mountain: 'petros', date: '2027-01-15', status: 'confirmed' },
  { id: 3, mountain: 'unknown-peak', date: '2027-02-01', status: 'complete' },
]

const logout = vi.fn()
const refetch = vi.fn()
const mutate = vi.fn()

function setup({ props = {}, fetchState = {}, mutation = {} } = {}) {
  useAuth.mockReturnValue({ user: { name: 'sasha', email: 'sasha@student.ua' }, logout })
  useFetch.mockReturnValue({ data: bookings, loading: false, error: null, refetch, ...fetchState })
  useMutation.mockReturnValue({ mutate, loading: false, ...mutation })
  const goTo = vi.fn()
  render(<Profile mountains={mountains} language="ua" t={t} goTo={goTo} {...props} />)
  return { goTo }
}

describe('Profile', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mutate.mockResolvedValue(undefined)
  })

  it('requests bookings from the API', () => {
    setup()
    expect(useFetch).toHaveBeenCalledWith('http://api/bookings')
  })

  it('renders heading, user info and booking count', () => {
    setup()
    expect(screen.getByRole('heading', { level: 1, name: t.accountTitle })).toBeInTheDocument()
    expect(screen.getByText(t.accountSubtitle)).toBeInTheDocument()
    expect(screen.getByText('sasha')).toBeInTheDocument()
    expect(screen.getByText('sasha@student.ua')).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 2, name: t.bookings })).toBeInTheDocument()
    expect(screen.getByText('03')).toBeInTheDocument()
    expect(screen.getByText(t.demoNote)).toBeInTheDocument()
  })

  it('renders booking rows with names, ranges, dates and statuses (ua)', () => {
    setup()
    const rows = screen.getAllByRole('row')
    expect(rows).toHaveLength(4) // header + 3
    const first = within(rows[1])
    expect(first.getByText('Говерла')).toBeInTheDocument()
    expect(first.getByText('Чорногора · Івано-Франківська область')).toBeInTheDocument()
    const expected = new Intl.DateTimeFormat('uk-UA', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(new Date('2026-12-04T12:00:00'))
    expect(first.getByText(expected)).toBeInTheDocument()
    expect(first.getByText(t.pending).className).toContain('status--pending')
    expect(within(rows[2]).getByText(t.confirmed).className).toContain('status--confirmed')
    expect(within(rows[3]).getByText(t.complete).className).toContain('status--complete')
  })

  it('falls back to the mountain id when the mountain is unknown', () => {
    setup()
    expect(screen.getByText('unknown-peak')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Скасувати: unknown-peak' })).toBeInTheDocument()
  })

  it('uses the mountain id in the confirm dialog when the mountain is unknown', async () => {
    setup()
    await userEvent.click(screen.getByRole('button', { name: 'Скасувати: unknown-peak' }))
    expect(screen.getByRole('alertdialog')).toHaveAccessibleDescription(
      'Заявку на unknown-peak буде видалено.',
    )
  })

  it('formats dates and names in english', () => {
    setup({ props: { language: 'en' } })
    expect(screen.getByText('Hoverla')).toBeInTheDocument()
    expect(screen.getByText('4 December 2026')).toBeInTheDocument()
  })

  it('shows the success notice when provided', () => {
    setup({ props: { notice: 'Заявку створено' } })
    expect(screen.getByRole('status')).toHaveTextContent('Заявку створено')
  })

  it('does not show a notice by default', () => {
    setup()
    expect(screen.queryByRole('status')).not.toBeInTheDocument()
  })

  it('signs the user out and redirects to /login', async () => {
    setup()
    await userEvent.click(screen.getByRole('button', { name: t.signOut }))
    expect(logout).toHaveBeenCalledTimes(1)
    expect(navigate).toHaveBeenCalledWith('/login')
  })

  it('shows the empty state when there are no bookings', async () => {
    const { goTo } = setup({ fetchState: { data: [] } })
    expect(screen.getByText(t.noBookings)).toBeInTheDocument()
    expect(screen.getByText('00')).toBeInTheDocument()
    expect(screen.queryByRole('table')).not.toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: new RegExp(t.firstVisit) }))
    expect(goTo).toHaveBeenCalledWith('mountains')
  })

  it('treats null data as no bookings', () => {
    setup({ fetchState: { data: null } })
    expect(screen.getByText(t.noBookings)).toBeInTheDocument()
  })

  it('shows the loading state', () => {
    setup({ fetchState: { loading: true } })
    expect(screen.getByRole('status')).toHaveTextContent('Завантаження…')
    expect(screen.queryByRole('table')).not.toBeInTheDocument()
  })

  it('shows the error state and refetches on retry', async () => {
    setup({ fetchState: { error: new Error('fail') } })
    expect(screen.getByRole('alert')).toHaveTextContent('Не вдалося завантажити дані')
    await userEvent.click(screen.getByRole('button', { name: 'Спробувати ще раз' }))
    expect(refetch).toHaveBeenCalledTimes(1)
  })

  it('opens the confirm dialog (ua) and cancels without deleting', async () => {
    setup()
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Скасувати: Говерла' }))
    const dialog = screen.getByRole('alertdialog')
    expect(dialog).toHaveAccessibleName('Скасувати бронювання?')
    expect(dialog).toHaveAccessibleDescription('Заявку на Говерла буде видалено.')
    await userEvent.click(screen.getByRole('button', { name: 'Залишити' }))
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument()
    expect(mutate).not.toHaveBeenCalled()
  })

  it('opens the confirm dialog in english', async () => {
    setup({ props: { language: 'en' } })
    await userEvent.click(screen.getByRole('button', { name: 'Скасувати: Hoverla' }))
    const dialog = screen.getByRole('alertdialog')
    expect(dialog).toHaveAccessibleName('Cancel booking?')
    expect(dialog).toHaveAccessibleDescription('Your booking for Hoverla will be deleted.')
    expect(screen.getByRole('button', { name: 'Yes, cancel' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Keep it' })).toBeInTheDocument()
  })

  it('deletes the booking, refetches and closes the dialog', async () => {
    setup()
    await userEvent.click(screen.getByRole('button', { name: 'Скасувати: Говерла' }))
    await userEvent.click(screen.getByRole('button', { name: 'Так, скасувати' }))
    await waitFor(() => expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument())
    expect(mutate).toHaveBeenCalledWith('http://api/bookings/1', { method: 'DELETE' })
    expect(refetch).toHaveBeenCalledTimes(1)
  })

  it('closes the dialog without refetch when deletion fails', async () => {
    mutate.mockRejectedValue(new Error('403'))
    setup()
    await userEvent.click(screen.getByRole('button', { name: 'Скасувати: Говерла' }))
    await userEvent.click(screen.getByRole('button', { name: 'Так, скасувати' }))
    await waitFor(() => expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument())
    expect(mutate).toHaveBeenCalledTimes(1)
    expect(refetch).not.toHaveBeenCalled()
  })

  it('disables delete buttons while a deletion is running', () => {
    setup({ mutation: { loading: true } })
    screen
      .getAllByRole('button', { name: /^Скасувати:/ })
      .forEach((button) => expect(button).toBeDisabled())
  })

  it('closes the dialog on Escape', async () => {
    setup()
    await userEvent.click(screen.getByRole('button', { name: 'Скасувати: Говерла' }))
    await userEvent.keyboard('{Escape}')
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument()
  })
})
