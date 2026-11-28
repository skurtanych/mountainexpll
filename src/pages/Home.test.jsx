import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import Home from './Home'
import { mountains, t } from '../testData'

function setup(props = {}) {
  const goTo = vi.fn()
  const onSelect = vi.fn()
  render(
    <Home mountains={mountains} language="ua" t={t} goTo={goTo} onSelect={onSelect} {...props} />,
  )
  return { goTo, onSelect }
}

describe('Home', () => {
  it('renders the hero section', () => {
    setup()
    expect(screen.getByRole('heading', { level: 1, name: 'Mountains' })).toBeInTheDocument()
    expect(screen.getByText(t.heroTagline)).toBeInTheDocument()
    expect(screen.getByText('CARPATHIAN MOUNTAINS')).toBeInTheDocument()
    expect(screen.getByText('SCROLL TO EXPLORE')).toBeInTheDocument()
  })

  it('renders the intro strip with stats', () => {
    setup()
    expect(screen.getByText(/Збирай моменти,/)).toBeInTheDocument()
    expect(screen.getByText(t.highPoint)).toBeInTheDocument()
    expect(screen.getByText(t.routes)).toBeInTheDocument()
    expect(screen.getByText(t.season)).toBeInTheDocument()
    expect(screen.getByText('06—10')).toBeInTheDocument()
  })

  it('renders the featured section heading', () => {
    setup()
    expect(screen.getByRole('heading', { level: 2, name: t.featured })).toBeInTheDocument()
    expect(screen.getByText(t.featuredText)).toBeInTheDocument()
  })

  it('shows only the first three mountains', () => {
    setup()
    const cards = screen.getAllByRole('article')
    expect(cards).toHaveLength(3)
    expect(within(cards[0]).getByRole('heading', { name: 'Говерла' })).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'Бребенескул' })).not.toBeInTheDocument()
  })

  it('renders english names', () => {
    setup({ language: 'en' })
    expect(screen.getByRole('heading', { name: 'Hoverla' })).toBeInTheDocument()
  })

  it('renders no cards for an empty list', () => {
    setup({ mountains: [] })
    expect(screen.queryByRole('article')).not.toBeInTheDocument()
  })

  it('navigates to the catalog via goTo("mountains")', async () => {
    const { goTo } = setup()
    await userEvent.click(screen.getByRole('button', { name: t.allMountains }))
    expect(goTo).toHaveBeenCalledWith('mountains')
  })

  it('passes the selected mountain to onSelect', async () => {
    const { onSelect } = setup()
    await userEvent.click(screen.getAllByTestId('mountain-card-image')[1])
    expect(onSelect).toHaveBeenCalledWith(mountains[1])
  })
})
