import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import Footer from './Footer'
import { t } from '../testData'

describe('Footer', () => {
  it('renders contact text, coordinates and copyright', () => {
    render(<Footer t={t} />)
    expect(screen.getByText(t.contact)).toBeInTheDocument()
    expect(screen.getByText('48°09′ N · 24°30′ E')).toBeInTheDocument()
    expect(screen.getByText('© 2026 MOUNTAINS EXPEDITIONS')).toBeInTheDocument()
    expect(screen.getByText('MADE FOR THE MOMENTS THAT MATTER')).toBeInTheDocument()
  })

  it('renders phone and email links', () => {
    render(<Footer t={t} />)
    expect(screen.getByRole('link', { name: /\+38 \(077\) 777-77-77/ })).toHaveAttribute(
      'href',
      'tel:+380777777777',
    )
    expect(screen.getByRole('link', { name: /info@mountains\.ua/ })).toHaveAttribute(
      'href',
      'mailto:info@mountains.ua',
    )
  })

  it('opens the social link in a new tab safely', () => {
    render(<Footer t={t} />)
    const link = screen.getByRole('link', { name: /Instagram/ })
    expect(link).toHaveAttribute('target', '_blank')
    expect(link).toHaveAttribute('rel', 'noreferrer')
    expect(screen.getByText(t.phone)).toBeInTheDocument()
    expect(screen.getByText(t.social)).toBeInTheDocument()
  })
})
