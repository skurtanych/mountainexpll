import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import LoginForm from './LoginForm'
import { t } from '../testData'

describe('LoginForm', () => {
  it('renders title, subtitle, fields with default values and demo note', () => {
    render(<LoginForm t={t} onSubmit={vi.fn()} />)
    expect(screen.getByRole('heading', { level: 1, name: t.loginTitle })).toBeInTheDocument()
    expect(screen.getByText(t.loginSubtitle)).toBeInTheDocument()
    expect(screen.getByLabelText(t.email)).toHaveValue('traveler@mountains.ua')
    expect(screen.getByLabelText(t.password)).toHaveValue('mountainpass')
    expect(screen.getByLabelText(t.password)).toHaveAttribute('type', 'password')
    expect(screen.getByText(t.demoNote)).toBeInTheDocument()
  })

  it('does not render a notice when notice is not provided', () => {
    render(<LoginForm t={t} onSubmit={vi.fn()} />)
    expect(screen.queryByRole('status')).not.toBeInTheDocument()
  })

  it('renders a regular notice', () => {
    render(<LoginForm t={t} notice="Реєстрація успішна" onSubmit={vi.fn()} />)
    const notice = screen.getByRole('status')
    expect(notice).toHaveTextContent('Реєстрація успішна')
    expect(notice.className).not.toContain('notice--error')
  })

  it('renders an error notice when notice equals t.emailError', () => {
    render(<LoginForm t={t} notice={t.emailError} onSubmit={vi.fn()} />)
    expect(screen.getByRole('status').className).toContain('notice--error')
  })

  it('calls onSubmit when the form is submitted', async () => {
    const onSubmit = vi.fn((e) => e.preventDefault())
    render(<LoginForm t={t} onSubmit={onSubmit} />)
    await userEvent.click(screen.getByRole('button', { name: t.signIn }))
    expect(onSubmit).toHaveBeenCalledTimes(1)
  })

  it('does not submit when email is empty (required)', async () => {
    const onSubmit = vi.fn((e) => e.preventDefault())
    render(<LoginForm t={t} onSubmit={onSubmit} />)
    await userEvent.clear(screen.getByLabelText(t.email))
    await userEvent.click(screen.getByRole('button', { name: t.signIn }))
    expect(onSubmit).not.toHaveBeenCalled()
  })
})
