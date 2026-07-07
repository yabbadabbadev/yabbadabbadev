import type { PhotoMetadata, TimelineDataNode } from '../../../../types'
import type L from 'leaflet'

export interface ExplorerState {
  selectedPhoto: PhotoMetadata | null
  hoveredTimeNode: string | null
  selectedTimeNode: string | null
  highlightedPhotoIds: Set<string>
  timelineData: TimelineDataNode[]
}

export interface ExplorerActions {
  setSelectedPhoto: (photo: PhotoMetadata | null) => void
  setHoveredTimeNode: (node: string | null) => void
  setSelectedTimeNode: (node: string | null) => void
  clearTimeFilter: () => void
}

export interface ExplorerMeta {
  mapInstance: React.MutableRefObject<L.Map | null>
  markersRef: React.MutableRefObject<{ [key: string]: L.Marker }>
  boundsRef: React.MutableRefObject<L.LatLngBounds | null>
  lastMapStateRef: React.MutableRefObject<{ center: L.LatLng; zoom: number } | null>
  dialogRef: React.RefObject<HTMLDialogElement | null>
  mapRef: React.RefObject<HTMLDivElement | null>
}

export interface ExplorerContextValue {
  state: ExplorerState
  actions: ExplorerActions
  meta: ExplorerMeta
}
