import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import MountainCard from './MountainCard'
import { mountain, t } from '../testData'

describe('MountainCard', () => {
  it('renders ukrainian texts', () => {
    render(<MountainCard mountain={mountain} index={0} language="ua" t={t} onSelect={vi.fn()} />)
    expect(screen.getByRole('heading', { name: 'Говерла' })).toBeInTheDocument()
    expect(screen.getByText('Чорногора · Івано-Франківська область')).toBeInTheDocument()
    expect(screen.getByText(/Середня/)).toBeInTheDocument()
    expect(screen.getByText(/2 061 м/)).toBeInTheDocument()
  })

  it('renders english texts', () => {
    render(<MountainCard mountain={mountain} index={0} language="en" t={t} onSelect={vi.fn()} />)
    expect(screen.getByRole('heading', { name: 'Hoverla' })).toBeInTheDocument()
    expect(screen.getByText(/Moderate/)).toBeInTheDocument()
  })

  it('sets background image, card order and aria-label', () => {
    render(<MountainCard mountain={mountain} index={3} language="ua" t={t} onSelect={vi.fn()} />)
    const image = screen.getByTestId('mountain-card-image')
    expect(image.style.backgroundImage).toContain('hoverla.jpg')
    expect(image).toHaveAttribute('aria-label', `${t.discover}: Говерла`)
    expect(screen.getByRole('article').style.getPropertyValue('--card-order')).toBe('3')
  })

  it('calls onSelect with the mountain when the image is clicked', async () => {
    const onSelect = vi.fn()
    render(<MountainCard mountain={mountain} index={0} language="ua" t={t} onSelect={onSelect} />)
    await userEvent.click(screen.getByTestId('mountain-card-image'))
    expect(onSelect).toHaveBeenCalledWith(mountain)
  })

  it('calls onSelect with the mountain when the text button is clicked', async () => {
    const onSelect = vi.fn()
    render(<MountainCard mountain={mountain} index={0} language="ua" t={t} onSelect={onSelect} />)
    await userEvent.click(screen.getByRole('button', { name: t.discover }))
    expect(onSelect).toHaveBeenCalledTimes(1)
    expect(onSelect).toHaveBeenCalledWith(mountain)
  })
})
