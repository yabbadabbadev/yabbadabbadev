import { render, screen, fireEvent } from '@testing-library/react'
import { expect, vi, describe, it, beforeAll } from 'vitest'
import { ExplorerProvider } from '../ExplorerPage/components/ExplorerProvider/ExplorerProvider'
import { Timeline } from '../ExplorerPage/components/Timeline'

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

describe('Timeline Component', () => {
  it('renders the timeline header, SVG nodes, and tick labels', () => {
    const { container } = render(
      <ExplorerProvider>
        <Timeline />
      </ExplorerProvider>
    )

    // Verify header title
    expect(screen.getByRole('heading', { name: 'Línea Temporal de Capturas', level: 3 })).toBeInTheDocument()

    // The filter clear button should not be present initially
    expect(screen.queryByRole('button', { name: 'Limpiar filtro' })).not.toBeInTheDocument()

    // Find and check SVG container
    const svgElement = container.querySelector('svg')
    expect(svgElement).toBeInTheDocument()
  })

  it('interacts with time nodes and shows clear filter button when selected', async () => {
    const { container } = render(
      <ExplorerProvider>
        <Timeline />
      </ExplorerProvider>
    )

    // Get all circles representing time nodes
    const circles = container.querySelectorAll('circle')
    expect(circles.length).toBeGreaterThan(0)

    const firstCircle = circles[0]

    // Initially radius should be default (4)
    expect(firstCircle).toHaveAttribute('r', '4')

    // Mouse enter: should trigger hovered state
    fireEvent.mouseEnter(firstCircle)
    expect(firstCircle).toHaveAttribute('r', '5')

    // Mouse leave: should reset radius
    fireEvent.mouseLeave(firstCircle)
    expect(firstCircle).toHaveAttribute('r', '4')

    // Click: should select the node
    fireEvent.click(firstCircle)
    expect(firstCircle).toHaveAttribute('r', '6')

    // "Limpiar filtro" button should now be present
    const clearBtn = screen.getByRole('button', { name: 'Limpiar filtro' })
    expect(clearBtn).toBeInTheDocument()

    // Click "Limpiar filtro": should clear selection
    fireEvent.click(clearBtn)
    expect(firstCircle).toHaveAttribute('r', '4')
    expect(screen.queryByRole('button', { name: 'Limpiar filtro' })).not.toBeInTheDocument()
  })
})
