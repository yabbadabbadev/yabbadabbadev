import { render, screen } from '@testing-library/react'
import { Header } from '../ExplorerPage/components/Header/Header'
import { MemoryRouter } from 'react-router-dom'
import { expect, describe, it } from 'vitest'
import rawMetadata from '../../photos-metadata.json'

describe('Header Component', () => {
  it('renders title, photo count and navigation link correctly', () => {
    render(
      <MemoryRouter>
        <Header />
      </MemoryRouter>
    )

    // Verify Title
    expect(screen.getByRole('heading', { name: 'Explorador de Viajes', level: 1 })).toBeInTheDocument()

    // Verify Photo Count
    const expectedCount = rawMetadata.length
    expect(screen.getByText(`${expectedCount} fotos capturadas con metadatos GPS`)).toBeInTheDocument()

    // Verify Cargar Foto Link
    const link = screen.getByRole('link', { name: 'Cargar Foto' })
    expect(link).toBeInTheDocument()
    expect(link).toHaveAttribute('href', '/upload')
  })
})
