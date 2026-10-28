import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { cleanup, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from './App.jsx'

beforeEach(() => {
  localStorage.clear()
  window.scrollTo = vi.fn()
})

afterEach(() => {
  cleanup()
})

describe('Mountains Expeditions', () => {
  it('opens a summit detail from the catalog', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.click(screen.getByRole('button', { name: 'Mountains', exact: true }))
    await user.click(screen.getByRole('button', { name: 'Дізнатись більше: Говерла' }))

    const dialog = screen.getByRole('dialog')
    expect(dialog).toBeVisible()
    expect(within(dialog).getByRole('heading', { name: 'Говерла' })).toBeVisible()
  })
})
