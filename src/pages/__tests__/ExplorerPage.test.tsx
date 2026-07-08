import { render, screen } from '@testing-library/react'
import { ExplorerPage } from '../ExplorerPage'
import { MemoryRouter } from 'react-router-dom'
import { expect, vi, describe, it, beforeAll } from 'vitest'

// Mock Leaflet
vi.mock('leaflet', (): Record<string, unknown> => {
  return {
    default: {
      map: (): Record<string, unknown> => ({
        setView: vi.fn().mockReturnThis(),
        remove: vi.fn(),
        fitBounds: vi.fn(),
      }),
      control: {
        zoom: (): Record<string, unknown> => ({
          addTo: vi.fn()
        })
      },
      tileLayer: (): Record<string, unknown> => ({
        addTo: vi.fn()
      }),
      featureGroup: (): Record<string, unknown> => ({
        addLayer: vi.fn(),
        getBounds: vi.fn()
      }),
      divIcon: vi.fn(),
      marker: (): Record<string, unknown> => ({
        on: vi.fn().mockReturnThis(),
        addTo: vi.fn()
      })
    }
  }
})

// Mock HTMLDialogElement functions
beforeAll((): void => {
  HTMLDialogElement.prototype.showModal = vi.fn()
  HTMLDialogElement.prototype.close = vi.fn()
})

describe('ExplorerPage', () => {
  it('renders correctly with all subcomponents and layout wrapper', () => {
    const { container } = render(
      <MemoryRouter>
        <ExplorerPage />
      </MemoryRouter>
    )

    // Check that layout container is rendered
    const layout = container.querySelector('.explorer-page-layout')
    expect(layout).toBeInTheDocument()

    // Check Header rendering
    expect(screen.getByRole('heading', { name: 'Explorador de Viajes', level: 1 })).toBeInTheDocument()

    // Check Timeline rendering
    expect(screen.getByRole('heading', { name: 'Línea Temporal de Capturas', level: 3 })).toBeInTheDocument()
  })
})
