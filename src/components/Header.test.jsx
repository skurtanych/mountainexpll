import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import Header from './Header'
import { useAuth } from '../hooks/useAuth'
import { t } from '../testData'

vi.mock('../hooks/useAuth', () => ({ useAuth: vi.fn() }))

function setup({ user = null, language = 'ua', route = '/home' } = {}) {
  useAuth.mockReturnValue({ user })
  const setLanguage = vi.fn()
  const onNavigate = vi.fn()
  render(
    <MemoryRouter initialEntries={[route]}>
      <Header language={language} setLanguage={setLanguage} onNavigate={onNavigate} t={t} />
    </MemoryRouter>,
  )
  return { setLanguage, onNavigate }
}

describe('Header', () => {
  beforeEach(() => vi.clearAllMocks())

  it('renders navigation links and the current language', () => {
    setup()
    const homeLinks = screen.getAllByRole('link', { name: 'Home' })
    expect(homeLinks).toHaveLength(2) // логотип + пункт меню
    homeLinks.forEach((link) => expect(link).toHaveAttribute('href', '/home'))
    expect(screen.getByRole('link', { name: 'Mountains' })).toHaveAttribute('href', '/mountains')
    expect(screen.getByText('UA')).toBeInTheDocument()
  })

  it('marks the active link', () => {
    setup({ route: '/mountains' })
    expect(screen.getByRole('link', { name: 'Mountains' }).className).toContain('is-active')
    const links = screen.getAllByRole('link', { name: 'Home' })
    expect(links.some((l) => l.className.includes('is-active'))).toBe(false)
  })

  it('links profile to /login for a guest', () => {
    setup({ user: null })
    expect(screen.getByText('Profile').closest('a')).toHaveAttribute('href', '/login')
    expect(screen.getByLabelText('Profile')).toHaveAttribute('href', '/login')
  })

  it('links profile to /profile for a logged-in user', () => {
    setup({ user: { id: 1 } })
    expect(screen.getByText('Profile').closest('a')).toHaveAttribute('href', '/profile')
    expect(screen.getByLabelText('Profile')).toHaveAttribute('href', '/profile')
  })

  it('toggles the language: ua -> en', async () => {
    const { setLanguage } = setup({ language: 'ua' })
    await userEvent.click(screen.getByRole('button', { name: t.language }))
    const updater = setLanguage.mock.calls[0][0]
    expect(updater('ua')).toBe('en')
    expect(updater('en')).toBe('ua')
  })

  it('shows EN when the language is en', () => {
    setup({ language: 'en' })
    expect(screen.getByText('EN')).toBeInTheDocument()
  })

  it('calls onNavigate when links are clicked', async () => {
    const { onNavigate } = setup()
    await userEvent.click(screen.getByRole('link', { name: 'Mountains' }))
    await userEvent.click(screen.getByText('Profile'))
    await userEvent.click(screen.getByLabelText('Profile'))
    await userEvent.click(screen.getAllByRole('link', { name: 'Home' })[0])
    expect(onNavigate).toHaveBeenCalledTimes(4)
  })
})
