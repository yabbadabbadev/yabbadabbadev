import { render } from '@testing-library/react'
import { expect, vi, describe, it, beforeAll } from 'vitest'
import { ExplorerProvider } from '../ExplorerPage/components/ExplorerProvider/ExplorerProvider'
import { Map } from '../ExplorerPage/components/Map/Map'

const { mockSetView, mockRemove, mockFitBounds, mockGetCenter, mockGetZoom, mockAddTo, mockAddLayer, mockGetBounds, mockMarkerOn } = vi.hoisted(() => ({
  mockSetView: vi.fn().mockReturnThis(),
  mockRemove: vi.fn(),
  mockFitBounds: vi.fn(),
  mockGetCenter: vi.fn().mockReturnValue({ lat: 25, lng: 10 }),
  mockGetZoom: vi.fn().mockReturnValue(2),
  mockAddTo: vi.fn(),
  mockAddLayer: vi.fn(),
  mockGetBounds: vi.fn().mockReturnValue({ pad: vi.fn() }),
  mockMarkerOn: vi.fn().mockReturnThis(),
}))

// Mock Leaflet
vi.mock('leaflet', (): Record<string, unknown> => {
  return {
    default: {
      map: vi.fn().mockReturnValue({
        setView: mockSetView,
        remove: mockRemove,
        fitBounds: mockFitBounds,
        getCenter: mockGetCenter,
        getZoom: mockGetZoom,
      }),
      control: {
        zoom: vi.fn().mockReturnValue({
          addTo: mockAddTo
        })
      },
      tileLayer: vi.fn().mockReturnValue({
        addTo: mockAddTo
      }),
      featureGroup: vi.fn().mockReturnValue({
        addLayer: mockAddLayer,
        getBounds: mockGetBounds
      }),
      divIcon: vi.fn(),
      marker: vi.fn().mockReturnValue({
        on: mockMarkerOn,
        addTo: mockAddTo
      })
    }
  }
})

// Mock HTMLDialogElement functions
beforeAll((): void => {
  HTMLDialogElement.prototype.showModal = vi.fn()
  HTMLDialogElement.prototype.close = vi.fn()
})

describe('Map Component', () => {
  it('renders Map element container and sets up Leaflet map', () => {
    const { container } = render(
      <ExplorerProvider>
        <Map />
      </ExplorerProvider>
    )

    const mapDiv = container.querySelector('.explorer-map-container')
    expect(mapDiv).toBeInTheDocument()
  })
})
