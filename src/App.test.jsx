import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { cleanup, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import App from './App.jsx'

beforeEach(() => {
  localStorage.clear()
  window.scrollTo = vi.fn()
})

function renderApp(route = '/') {
  return render(
    <MemoryRouter initialEntries={[route]}>
      <App />
    </MemoryRouter>,
  )
}

afterEach(() => {
  cleanup()
})

describe('Mountains Expeditions', () => {
  it('opens a summit detail from the catalog', async () => {
    const user = userEvent.setup()
    renderApp()

    await user.click(screen.getByRole('link', { name: 'Mountains', exact: true }))
    await user.click(screen.getByRole('button', { name: 'Дізнатись більше: Говерла' }))

    const dialog = screen.getByRole('dialog')
    expect(dialog).toBeVisible()
    expect(within(dialog).getByRole('heading', { name: 'Говерла' })).toBeVisible()
  })

  it('saves a demo booking after sign-in', async () => {
    const user = userEvent.setup()
    renderApp()

    await user.click(screen.getByRole('link', { name: 'Mountains', exact: true }))
    await user.click(screen.getByRole('button', { name: 'Дізнатись більше: Говерла' }))
    await user.click(screen.getByRole('button', { name: 'Увійти для бронювання' }))
    await user.clear(screen.getByLabelText('Електронна пошта'))
    await user.type(screen.getByLabelText('Електронна пошта'), 'hiker@example.com')
    await user.clear(screen.getByLabelText('Пароль'))
    await user.type(screen.getByLabelText('Пароль'), 'carpathians123')
    await user.click(screen.getByRole('button', { name: 'Увійти', exact: true }))

    expect(screen.getByText('Маршрут додано до твоїх бронювань.')).toBeVisible()
    expect(JSON.parse(localStorage.getItem('mountains-user')).email).toBe('hiker@example.com')
    expect(JSON.parse(localStorage.getItem('mountains-bookings')).length).toBe(4)
  })

  it('navigates between pages with the router', async () => {
    const user = userEvent.setup()
    renderApp()

    expect(screen.getByRole('heading', { name: 'Mountains', level: 1 })).toBeVisible()
    await user.click(screen.getByRole('link', { name: 'Mountains', exact: true }))
    expect(screen.getByRole('link', { name: 'Mountains', exact: true })).toHaveAttribute(
      'aria-current',
      'page',
    )
    await user.click(screen.getAllByRole('link', { name: 'Profile' })[0])
    expect(screen.getByLabelText('Електронна пошта')).toBeVisible()
  })

  it('redirects unknown routes to the home page', () => {
    renderApp('/no-such-page')

    expect(screen.getByRole('heading', { name: 'Mountains', level: 1 })).toBeVisible()
  })
})
