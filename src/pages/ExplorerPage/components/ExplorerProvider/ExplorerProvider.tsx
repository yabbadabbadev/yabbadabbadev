import React, { createContext, useContext, useState, useMemo, useRef } from 'react'
import rawMetadata from '../../../../photos-metadata.json'
import type { PhotoMetadata, TimelineDataNode } from '../../../../types'
import type { ExplorerContextValue, ExplorerState, ExplorerActions, ExplorerMeta } from './types'
import type L from 'leaflet'

const ExplorerContext = createContext<ExplorerContextValue | null>(null)

const photos: PhotoMetadata[] = rawMetadata as PhotoMetadata[]

export const ExplorerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstance = useRef<L.Map | null>(null)
  const markersRef = useRef<{ [key: string]: L.Marker }>({})
  const boundsRef = useRef<L.LatLngBounds | null>(null)
  const lastMapStateRef = useRef<{ center: L.LatLng; zoom: number } | null>(null)
  const dialogRef = useRef<HTMLDialogElement>(null)

  const [selectedPhoto, setSelectedPhoto] = useState<PhotoMetadata | null>(null)
  const [hoveredTimeNode, setHoveredTimeNode] = useState<string | null>(null)
  const [selectedTimeNode, setSelectedTimeNode] = useState<string | null>(null)

  // Agrupación por año/mes para el gráfico temporal
  const timelineData = useMemo<TimelineDataNode[]>(() => {
    const counts: { [key: string]: { count: number; label: string; year: number; month: number; photos: PhotoMetadata[] } } = {}
    
    photos.forEach((photo) => {
      const key = `${photo.year}-${photo.month.toString().padStart(2, '0')}`
      if (!counts[key]) {
        const monthStr = new Date(photo.year, photo.month - 1).toLocaleDateString('es-ES', { month: 'short' })
        const monthLabel = monthStr.charAt(0).toUpperCase() + monthStr.slice(1)
        counts[key] = {
          count: 0,
          label: `${monthLabel} ${photo.year}`,
          year: photo.year,
          month: photo.month,
          photos: []
        }
      }
      counts[key].count++
      counts[key].photos.push(photo)
    })

    return Object.entries(counts)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([key, data]) => ({ key, ...data }))
  }, [])

  // IDs de fotos resaltadas por filtro de fecha
  const highlightedPhotoIds = useMemo<Set<string>>(() => {
    const activeNode = hoveredTimeNode || selectedTimeNode
    if (!activeNode) return new Set<string>()
    const data = timelineData.find((d) => d.key === activeNode)
    return new Set<string>(data ? data.photos.map((p) => p.id) : [])
  }, [hoveredTimeNode, selectedTimeNode, timelineData])

  const state: ExplorerState = useMemo(() => ({
    selectedPhoto,
    hoveredTimeNode,
    selectedTimeNode,
    highlightedPhotoIds,
    timelineData
  }), [selectedPhoto, hoveredTimeNode, selectedTimeNode, highlightedPhotoIds, timelineData])

  const actions: ExplorerActions = useMemo(() => ({
    setSelectedPhoto,
    setHoveredTimeNode,
    setSelectedTimeNode,
    clearTimeFilter: () => setSelectedTimeNode(null)
  }), [])

  const meta: ExplorerMeta = useMemo(() => ({
    mapInstance,
    markersRef,
    boundsRef,
    lastMapStateRef,
    dialogRef,
    mapRef
  }), [])

  const contextValue: ExplorerContextValue = useMemo(() => ({
    state,
    actions,
    meta
  }), [state, actions, meta])

  return (
    <ExplorerContext.Provider value={contextValue}>
      {children}
    </ExplorerContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export const useExplorer = (): ExplorerContextValue => {
  const context = useContext(ExplorerContext)
  if (!context) {
    throw new Error('useExplorer must be used within an ExplorerProvider')
  }
  return context
}
