import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import App from './App'

describe('Карпати App', () => {
  it('відображає головний заголовок та основні розділи', () => {
    render(<App />)
    expect(screen.getByText('Відкрий Карпати')).toBeInTheDocument()
    expect(screen.getByText('Обери свою наступну вершину.')).toBeInTheDocument()
    expect(screen.getByText('Допомагаємо планувати подорожі Карпатами.')).toBeInTheDocument()
  })
})
