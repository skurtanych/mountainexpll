import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { cleanup, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import App from './App.jsx'
import AuthProvider from './context/AuthProvider'
import { mountains } from './data/mountains'

const hoverla = mountains.find((mountain) => mountain.name.ua === 'Говерла')

function reply(body, status = 200) {
  return { ok: status < 400, status, json: async () => body }
}

function mockApi({ bookings = [] } = {}) {
  const fetchMock = vi.fn(async (url, options = {}) => {
    const { pathname } = new URL(url)
    const method = options.method ?? 'GET'

    if (pathname === '/mountains') return reply(mountains)
    if (pathname === '/auth/login' && method === 'POST') {
      const { email, password } = JSON.parse(options.body)
      if (password !== 'carpathians123') {
        return reply({ message: 'Invalid email or password' }, 401)
      }
      return reply({ token: 'test-token', user: { id: 1, name: 'Hiker', email } })
    }
    if (pathname === '/bookings' && method === 'GET') return reply(bookings)
    return reply({ message: 'Not found' }, 404)
  })
  vi.stubGlobal('fetch', fetchMock)
  return fetchMock
}

function renderApp(route = '/') {
  return render(
    <MemoryRouter initialEntries={[route]}>
      <AuthProvider>
        <App />
      </AuthProvider>
    </MemoryRouter>,
  )
}

beforeEach(() => {
  localStorage.clear()
  window.scrollTo = vi.fn()
})

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
})

describe('Mountains Expeditions', () => {
  it('loads mountains from the API and opens a summit detail', async () => {
    mockApi()
    const user = userEvent.setup()
    renderApp()

    await user.click(screen.getByRole('link', { name: 'Mountains', exact: true }))
    await user.click(await screen.findByRole('button', { name: 'Дізнатись більше: Говерла' }))

    const dialog = screen.getByRole('dialog')
    expect(dialog).toBeVisible()
    expect(within(dialog).getByRole('heading', { name: 'Говерла' })).toBeVisible()
  })

  it('filters mountains by name', async () => {
    mockApi()
    const user = userEvent.setup()
    renderApp('/mountains')

    await screen.findByRole('button', { name: 'Дізнатись більше: Говерла' })
    await user.type(screen.getByRole('searchbox'), 'Говерла')

    expect(screen.getByRole('button', { name: 'Дізнатись більше: Говерла' })).toBeVisible()
    expect(screen.getAllByTestId('mountain-card-image')).toHaveLength(
      mountains.filter((mountain) => mountain.name.ua.toLowerCase().includes('говерла')).length,
    )
  })

  it('signs in through the API and shows bookings in the profile', async () => {
    mockApi({
      bookings: [{ id: 1, userId: 1, mountain: hoverla.id, date: '2026-12-01', status: 'pending' }],
    })
    const user = userEvent.setup()
    renderApp()

    await user.click(screen.getByRole('link', { name: 'Mountains', exact: true }))
    await user.click(await screen.findByRole('button', { name: 'Дізнатись більше: Говерла' }))
    await user.click(screen.getByRole('button', { name: 'Увійти для бронювання' }))
    await user.clear(screen.getByLabelText('Електронна пошта'))
    await user.type(screen.getByLabelText('Електронна пошта'), 'hiker@example.com')
    await user.clear(screen.getByLabelText('Пароль'))
    await user.type(screen.getByLabelText('Пароль'), 'carpathians123')
    await user.click(screen.getByRole('button', { name: 'Увійти', exact: true }))

    expect(
      await screen.findByRole('heading', { name: 'Особистий кабінет', level: 1 }),
    ).toBeVisible()
    expect(await screen.findByText('В обробці')).toBeVisible()
    expect(JSON.parse(localStorage.getItem('mountains-user')).email).toBe('hiker@example.com')
    expect(localStorage.getItem('mountains-token')).toBe('test-token')
  })

  it('redirects a guest from the profile to the login page', async () => {
    mockApi()
    renderApp('/profile')

    expect(await screen.findByLabelText('Електронна пошта')).toBeVisible()
  })

  it('navigates between pages with the router', async () => {
    mockApi()
    const user = userEvent.setup()
    renderApp()

    expect(screen.getByRole('heading', { name: 'Mountains', level: 1 })).toBeVisible()
    await user.click(screen.getByRole('link', { name: 'Mountains', exact: true }))
    expect(screen.getByRole('link', { name: 'Mountains', exact: true })).toHaveAttribute(
      'aria-current',
      'page',
    )
    await screen.findByRole('button', { name: 'Дізнатись більше: Говерла' })
    await user.click(screen.getAllByRole('link', { name: 'Profile' })[0])
    expect(screen.getByLabelText('Електронна пошта')).toBeVisible()
  })

  it('shows the 404 page for unknown routes', async () => {
    mockApi()
    renderApp('/no-such-page')

    expect(await screen.findByRole('heading', { name: '404', level: 1 })).toBeVisible()
  })
})
