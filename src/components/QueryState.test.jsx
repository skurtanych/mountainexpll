import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import QueryState from './QueryState'

describe('QueryState', () => {
  it('shows loading message (ua)', () => {
    render(
      <QueryState loading language="ua">
        <p>content</p>
      </QueryState>,
    )
    expect(screen.getByRole('status')).toHaveTextContent('Завантаження…')
    expect(screen.queryByText('content')).not.toBeInTheDocument()
  })

  it('shows loading message (en)', () => {
    render(
      <QueryState loading language="en">
        <p>content</p>
      </QueryState>,
    )
    expect(screen.getByRole('status')).toHaveTextContent('Loading…')
  })

  it('shows error with retry button and calls onRetry', async () => {
    const onRetry = vi.fn()
    render(
      <QueryState error onRetry={onRetry} language="en">
        <p>content</p>
      </QueryState>,
    )
    expect(screen.getByRole('alert')).toHaveTextContent('Could not load data')
    await userEvent.click(screen.getByRole('button', { name: 'Try again' }))
    expect(onRetry).toHaveBeenCalledTimes(1)
  })

  it('shows error without retry button when onRetry is not provided', () => {
    render(
      <QueryState error language="ua">
        <p>content</p>
      </QueryState>,
    )
    expect(screen.getByRole('alert')).toHaveTextContent('Не вдалося завантажити дані')
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })

  it('shows empty message', () => {
    render(
      <QueryState empty language="ua">
        <p>content</p>
      </QueryState>,
    )
    expect(screen.getByText('Нічого не знайдено')).toBeInTheDocument()
    expect(screen.queryByText('content')).not.toBeInTheDocument()
  })

  it('renders children when nothing is loading, failed or empty', () => {
    render(
      <QueryState language="ua">
        <p>content</p>
      </QueryState>,
    )
    expect(screen.getByText('content')).toBeInTheDocument()
  })

  it('loading has priority over error and empty', () => {
    render(
      <QueryState loading error empty language="en">
        <p>content</p>
      </QueryState>,
    )
    expect(screen.getByRole('status')).toHaveTextContent('Loading…')
  })

  it('error has priority over empty', () => {
    render(
      <QueryState error empty language="en">
        <p>content</p>
      </QueryState>,
    )
    expect(screen.getByRole('alert')).toBeInTheDocument()
    expect(screen.queryByText('Nothing found')).not.toBeInTheDocument()
  })
})
