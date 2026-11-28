import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import Login from './Login'
import { t } from '../testData'

describe('Login', () => {
  it('renders the aside with title, subtitle and quote', () => {
    render(<Login t={t} onSubmit={vi.fn()} />)
    expect(screen.getByRole('heading', { level: 1, name: t.signInTitle })).toBeInTheDocument()
    expect(screen.getByText(t.signInSubtitle)).toBeInTheDocument()
    expect(screen.getByText(/The best view comes after the hardest climb/)).toBeInTheDocument()
    expect(screen.getByText(new RegExp(`03 / ${t.profile}`))).toBeInTheDocument()
  })

  it('renders the login form', () => {
    render(<Login t={t} onSubmit={vi.fn()} />)
    expect(screen.getByRole('heading', { level: 1, name: t.loginTitle })).toBeInTheDocument()
    expect(screen.getByLabelText(t.email)).toBeInTheDocument()
    expect(screen.getByLabelText(t.password)).toBeInTheDocument()
  })

  it('passes the notice to the form', () => {
    render(<Login t={t} notice="Помилка входу" onSubmit={vi.fn()} />)
    expect(screen.getByRole('status')).toHaveTextContent('Помилка входу')
  })

  it('submits the form through onSubmit', async () => {
    const onSubmit = vi.fn((e) => e.preventDefault())
    render(<Login t={t} onSubmit={onSubmit} />)
    await userEvent.click(screen.getByRole('button', { name: t.signIn }))
    expect(onSubmit).toHaveBeenCalledTimes(1)
  })
})
