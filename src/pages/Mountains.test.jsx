import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import Mountains from './Mountains'
import { mountains, t } from '../testData'

const okStatus = { loading: false, error: null, refetch: vi.fn() }

function setup(props = {}) {
  const onSelect = vi.fn()
  render(
    <Mountains
      mountains={mountains}
      status={okStatus}
      language="ua"
      t={t}
      onSelect={onSelect}
      {...props}
    />,
  )
  return { onSelect }
}

describe('Mountains', () => {
  it('renders the heading and all mountains with a padded count', () => {
    setup()
    expect(screen.getByRole('heading', { level: 1, name: t.catalogTitle })).toBeInTheDocument()
    expect(screen.getByText(t.catalogText)).toBeInTheDocument()
    expect(screen.getAllByRole('article')).toHaveLength(4)
    expect(screen.getByText('04')).toBeInTheDocument()
  })

  it('uses ukrainian placeholders and labels', () => {
    setup()
    expect(screen.getByPlaceholderText('Пошук за назвою')).toBeInTheDocument()
    expect(screen.getByLabelText('Пошук')).toBeInTheDocument()
    expect(screen.getByRole('option', { name: 'Будь-яка складність' })).toBeInTheDocument()
  })

  it('uses english placeholders, labels and difficulty names', () => {
    setup({ language: 'en' })
    expect(screen.getByPlaceholderText('Search by name')).toBeInTheDocument()
    expect(screen.getByLabelText('Search')).toBeInTheDocument()
    expect(screen.getByRole('option', { name: 'Any difficulty' })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: 'Moderate' })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: 'Challenging' })).toBeInTheDocument()
  })

  it('lists each difficulty only once', () => {
    setup()
    // "any" + 2 унікальні складності
    expect(screen.getAllByRole('option')).toHaveLength(3)
  })

  it('filters by name case-insensitively', async () => {
    setup()
    await userEvent.type(screen.getByLabelText('Пошук'), 'ГОВЕР')
    expect(screen.getAllByRole('article')).toHaveLength(1)
    expect(screen.getByRole('heading', { name: 'Говерла' })).toBeInTheDocument()
    expect(screen.getByText('01')).toBeInTheDocument()
  })

  it('ignores leading and trailing spaces in the query', async () => {
    setup()
    await userEvent.type(screen.getByLabelText('Пошук'), '  петрос  ')
    expect(screen.getAllByRole('article')).toHaveLength(1)
  })

  it('filters by difficulty', async () => {
    setup()
    await userEvent.selectOptions(screen.getByRole('combobox'), 'Складна')
    const cards = screen.getAllByRole('article')
    expect(cards).toHaveLength(2)
    expect(screen.getByRole('heading', { name: 'Піп Іван' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Бребенескул' })).toBeInTheDocument()
  })

  it('combines name and difficulty filters and shows the empty state', async () => {
    setup()
    await userEvent.selectOptions(screen.getByRole('combobox'), 'Складна')
    await userEvent.type(screen.getByLabelText('Пошук'), 'Говерла')
    expect(screen.queryByRole('article')).not.toBeInTheDocument()
    expect(screen.getByText('Нічого не знайдено')).toBeInTheDocument()
    expect(screen.getByText('00')).toBeInTheDocument()
  })

  it('resets the difficulty filter to "all"', async () => {
    setup()
    const select = screen.getByRole('combobox')
    await userEvent.selectOptions(select, 'Складна')
    await userEvent.selectOptions(select, 'all')
    expect(screen.getAllByRole('article')).toHaveLength(4)
  })

  it('shows the empty state for an empty list', () => {
    setup({ mountains: [] })
    expect(screen.getByText('Нічого не знайдено')).toBeInTheDocument()
  })

  it('shows the loading state', () => {
    setup({ status: { loading: true, error: null, refetch: vi.fn() } })
    expect(screen.getByRole('status')).toHaveTextContent('Завантаження…')
    expect(screen.queryByRole('article')).not.toBeInTheDocument()
  })

  it('shows the error state and retries via status.refetch', async () => {
    const refetch = vi.fn()
    setup({ status: { loading: false, error: new Error('fail'), refetch } })
    expect(screen.getByRole('alert')).toHaveTextContent('Не вдалося завантажити дані')
    await userEvent.click(screen.getByRole('button', { name: 'Спробувати ще раз' }))
    expect(refetch).toHaveBeenCalledTimes(1)
  })

  it('passes the selected mountain to onSelect', async () => {
    const { onSelect } = setup()
    await userEvent.click(screen.getAllByTestId('mountain-card-image')[2])
    expect(onSelect).toHaveBeenCalledWith(mountains[2])
  })
})
