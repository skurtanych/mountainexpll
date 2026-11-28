import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import ProtectedRoute from './ProtectedRoute'
import { useAuth } from '../hooks/useAuth'

vi.mock('../hooks/useAuth', () => ({ useAuth: vi.fn() }))

function renderRoute() {
  render(
    <MemoryRouter initialEntries={['/profile']}>
      <Routes>
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <p>Secret profile</p>
            </ProtectedRoute>
          }
        />
        <Route path="/login" element={<p>Login page</p>} />
      </Routes>
    </MemoryRouter>,
  )
}

describe('ProtectedRoute', () => {
  beforeEach(() => vi.clearAllMocks())

  it('renders children for an authenticated user', () => {
    useAuth.mockReturnValue({ user: { id: 1 } })
    renderRoute()
    expect(screen.getByText('Secret profile')).toBeInTheDocument()
    expect(screen.queryByText('Login page')).not.toBeInTheDocument()
  })

  it('redirects a guest to /login', () => {
    useAuth.mockReturnValue({ user: null })
    renderRoute()
    expect(screen.getByText('Login page')).toBeInTheDocument()
    expect(screen.queryByText('Secret profile')).not.toBeInTheDocument()
  })
})
