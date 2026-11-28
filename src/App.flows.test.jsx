import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import App from './App.jsx'
import AuthProvider from './context/AuthProvider'
import { copy } from './data/copy'
import { mountains } from './data/mountains'

const hoverla = mountains.find((mountain) => mountain.name.ua === 'Говерла')
const ua = copy.ua
const en = copy.en

function reply(body, status = 200) {
  return { ok: status < 400, status, json: async () => body }
}

function mockApi({ bookingResponse = reply({ id: 9 }, 201) } = {}) {
  const fetchMock = vi.fn(async (url, options = {}) => {
    const { pathname } = new URL(url)
    const method = options.method ?? 'GET'

    if (pathname === '/mountains') return reply(mountains)
    if (pathname === '/auth/login' && method === 'POST') {
      return reply({ message: 'Invalid email or password' }, 401)
    }
    if (pathname === '/bookings' && method === 'POST') return bookingResponse
    if (pathname === '/bookings' && method === 'GET') return reply([])
    return reply({ message: 'Not found' }, 404)
  })
  vi.stubGlobal('fetch', fetchMock)
  return fetchMock
}

function storeSession() {
  localStorage.setItem('mountains-token', 'test-token')
  localStorage.setItem(
    'mountains-user',
    JSON.stringify({ id: 1, name: 'Hiker', email: 'hiker@example.com' }),
  )
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

async function openHoverla(user, lang = 'ua') {
  const label = `${copy[lang].discover}: ${hoverla.name[lang]}`
  await user.click(await screen.findByRole('button', { name: label }))
}

beforeEach(() => {
  localStorage.clear()
  window.scrollTo = vi.fn()
})

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
})

describe('App: booking flow', () => {
  it('creates a booking, shows the notice and opens the profile (ua)', async () => {
    const fetchMock = mockApi()
    storeSession()
    const user = userEvent.setup()
    renderApp('/mountains')

    await openHoverla(user)
    await user.click(screen.getByRole('button', { name: ua.book }))

    expect(await screen.findByRole('heading', { name: ua.accountTitle, level: 1 })).toBeVisible()
    expect(screen.getByText('Заявку створено')).toBeVisible()

    const post = fetchMock.mock.calls.find(
      ([url, options]) => url.endsWith('/bookings') && options?.method === 'POST',
    )
    const body = JSON.parse(post[1].body)
    expect(body.mountain).toBe(hoverla.id)
    expect(body.date).toMatch(/^\d{4}-\d{2}-\d{2}$/)
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('shows the success notice in english', async () => {
    mockApi()
    storeSession()
    const user = userEvent.setup()
    renderApp('/mountains')

    await user.click(screen.getByRole('button', { name: ua.language }))
    await openHoverla(user, 'en')
    await user.click(screen.getByRole('button', { name: en.book }))

    expect(await screen.findByText('Booking created')).toBeVisible()
  })

  it.each([
    [
      'ua',
      409,
      'Mountain already booked for this date',
      'Ви вже забронювали цю гору на цю дату. Оберіть іншу дату.',
    ],
    ['ua', 500, 'Server error', 'Не вдалося створити заявку. Спробуй ще раз.'],
    [
      'en',
      409,
      'Mountain already booked for this date',
      'You already booked this mountain for this date. Choose another date.',
    ],
    ['en', 500, 'Server error', 'Booking failed. Please try again.'],
  ])('shows a booking error (%s, HTTP %i)', async (lang, status, message, expected) => {
    mockApi({ bookingResponse: reply({ message }, status) })
    storeSession()
    const user = userEvent.setup()
    renderApp('/mountains')

    if (lang === 'en') await user.click(screen.getByRole('button', { name: ua.language }))
    await openHoverla(user, lang)
    await user.click(screen.getByRole('button', { name: copy[lang].book }))

    expect(await screen.findByRole('alert')).toHaveTextContent(expected)
    expect(screen.getByRole('dialog')).toBeVisible()
  })
})

describe('App: modal', () => {
  it('closes the modal with Escape and clears the previous error', async () => {
    mockApi({ bookingResponse: reply({ message: 'Server error' }, 500) })
    storeSession()
    const user = userEvent.setup()
    renderApp('/mountains')

    await openHoverla(user)
    await user.click(screen.getByRole('button', { name: ua.book }))
    expect(await screen.findByRole('alert')).toBeVisible()

    await user.keyboard('{Escape}')
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()

    await openHoverla(user)
    expect(screen.getByRole('dialog')).toBeVisible()
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })

  it('ignores other keys while the modal is open', async () => {
    mockApi()
    const user = userEvent.setup()
    renderApp('/mountains')

    await openHoverla(user)
    await user.keyboard('{Enter}')
    expect(screen.getByRole('dialog')).toBeVisible()
  })

  it('closes the modal with the close button', async () => {
    mockApi()
    const user = userEvent.setup()
    renderApp('/mountains')

    await openHoverla(user)
    await user.click(screen.getByRole('button', { name: ua.close }))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })
})

describe('App: login and layout', () => {
  it('shows an error notice when the login fails', async () => {
    mockApi()
    const user = userEvent.setup()
    renderApp('/login')

    await user.click(screen.getByRole('button', { name: ua.signIn }))

    expect(await screen.findByRole('status')).toHaveTextContent(ua.emailError)
    expect(localStorage.getItem('mountains-token')).toBeNull()
  })

  it('hides the footer on the login page and shows it elsewhere', async () => {
    mockApi()
    renderApp('/login')
    expect(screen.queryByText(ua.contact)).not.toBeInTheDocument()

    cleanup()
    renderApp('/home')
    expect(await screen.findByText(ua.contact)).toBeVisible()
  })

  it('scrolls to the top on navigation', () => {
    mockApi()
    renderApp('/home')
    expect(window.scrollTo).toHaveBeenCalledWith({ top: 0, behavior: 'smooth' })
  })
})
