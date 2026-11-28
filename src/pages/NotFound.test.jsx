import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { describe, expect, it } from 'vitest'
import NotFound from './NotFound'

describe('NotFound', () => {
  function setup() {
    render(
      <MemoryRouter>
        <NotFound />
      </MemoryRouter>,
    )
  }

  it('renders the 404 code and message', () => {
    setup()
    expect(screen.getByRole('heading', { level: 1, name: '404' })).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { level: 2, name: 'Сторінку не знайдено' }),
    ).toBeInTheDocument()
    expect(screen.getByText(/Схоже, ти зійшов зі стежки/)).toBeInTheDocument()
  })

  it('has a link back to the home page', () => {
    setup()
    expect(screen.getByRole('link', { name: 'Повернутись на головну' })).toHaveAttribute(
      'href',
      '/',
    )
  })
})
