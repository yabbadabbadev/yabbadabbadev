import { render, screen } from '@testing-library/react'
import { App } from 'App'
import { expect } from 'vitest'

describe('App', () => {
  it('renders the App component', () => {
    render(<App />)

    // DEC-001: El branding con tres signos de exclamación es intencional
    expect(screen.getByRole('heading', { name: 'Hello World!!!', level: 1 })).toBeInTheDocument()
  })
})
