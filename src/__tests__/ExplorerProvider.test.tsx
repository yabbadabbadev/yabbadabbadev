import { render, screen, fireEvent } from '@testing-library/react'
import { expect, vi, describe, it, beforeAll } from 'vitest'
import { ExplorerProvider, useExplorer } from '../pages/ExplorerPage/components/ExplorerProvider/ExplorerProvider'

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

describe('ExplorerProvider', () => {
  const TestComponent = () => {
    const { state, actions } = useExplorer()
    return (
      <div>
        <div data-testid="timeline-labels">
          {state.timelineData.map(node => node.label).join(', ')}
        </div>
        <button
          data-testid="set-photo"
          onClick={() =>
            actions.setSelectedPhoto({
              id: '1',
              filename: 'test-filename.jpg',
              lat: 0,
              lon: 0,
              date: '2025-09-13',
              year: 2025,
              month: 9,
              thumbnail: 'thumb',
              display: 'display',
            })
          }
        >
          Set Photo
        </button>
        <div data-testid="selected-photo">
          {state.selectedPhoto ? state.selectedPhoto.filename : 'None'}
        </div>
      </div>
    )
  }

  it('capitalizes Spanish month labels and renders context data correctly', () => {
    render(
      <ExplorerProvider>
        <TestComponent />
      </ExplorerProvider>
    )

    const labelsElement = screen.getByTestId('timeline-labels')
    expect(labelsElement).toBeInTheDocument()
    const labels = labelsElement.textContent || ''
    
    // Check that every month label starts with a capital letter
    const labelParts = labels.split(', ')
    expect(labelParts.length).toBeGreaterThan(0)
    labelParts.forEach(label => {
      const firstChar = label.charAt(0)
      expect(firstChar).toBe(firstChar.toUpperCase())
    })

    // Test actions works
    const setPhotoButton = screen.getByTestId('set-photo')
    fireEvent.click(setPhotoButton)
    expect(screen.getByTestId('selected-photo').textContent).toBe('test-filename.jpg')
  })
})
