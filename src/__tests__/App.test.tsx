import { render, screen } from '@testing-library/react'
import { App } from '../App'
import { expect, vi } from 'vitest'

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

// Mock html-dialog-element functions
beforeAll((): void => {
  HTMLDialogElement.prototype.showModal = vi.fn()
  HTMLDialogElement.prototype.close = vi.fn()
})

describe('App Dashboard', (): void => {
  it('renders the main interactive dashboard layout', (): void => {
    render(<App />)

    // Verify Header Title exists
    expect(screen.getByRole('heading', { name: 'Explorador de Viajes', level: 1 })).toBeInTheDocument()
    
    // Verify Timeline header exists
    expect(screen.getByRole('heading', { name: 'Línea Temporal de Capturas', level: 3 })).toBeInTheDocument()
  })
})
