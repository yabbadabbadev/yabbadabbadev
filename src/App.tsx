import { useEffect, useRef, useState, useMemo } from 'react'
import L from 'leaflet'
import rawMetadata from './photos-metadata.json'

interface PhotoMetadata {
  id: string
  filename: string
  lat: number
  lon: number
  date: string
  year: number
  month: number
  thumbnail: string
  display: string
}

interface TimelineDataNode {
  key: string
  count: number
  label: string
  year: number
  month: number
  photos: PhotoMetadata[]
}

interface TimelinePoint extends TimelineDataNode {
  x: number
  y: number
}

type CountEntry = [string, { count: number; label: string; year: number; month: number; photos: PhotoMetadata[] }]

const photos: PhotoMetadata[] = rawMetadata as PhotoMetadata[]

const App = (): React.ReactElement => {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstance = useRef<L.Map | null>(null)
  const markersRef = useRef<{ [key: string]: L.Marker }>({})
  const boundsRef = useRef<L.LatLngBounds | null>(null)
  const lastMapStateRef = useRef<{ center: L.LatLng; zoom: number } | null>(null)
  const [selectedPhoto, setSelectedPhoto] = useState<PhotoMetadata | null>(null)
  const [hoveredTimeNode, setHoveredTimeNode] = useState<string | null>(null)
  const [selectedTimeNode, setSelectedTimeNode] = useState<string | null>(null)
  const dialogRef = useRef<HTMLDialogElement>(null)

  // Format Dates helper
  const formatDate = (dateStr: string): string => {
    const d = new Date(dateStr)
    return d.toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })
  }

  // Group photos by Year-Month for the timeline chart
  const timelineData = useMemo<TimelineDataNode[]>((): TimelineDataNode[] => {
    const counts: { [key: string]: { count: number; label: string; year: number; month: number; photos: PhotoMetadata[] } } = {}
    
    photos.forEach((photo: PhotoMetadata): void => {
      const key = `${photo.year}-${photo.month.toString().padStart(2, '0')}`
      if (!counts[key]) {
        const monthLabel = new Date(photo.year, photo.month - 1).toLocaleDateString('es-ES', { month: 'short' })
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
      .sort((a: CountEntry, b: CountEntry): number => a[0].localeCompare(b[0]))
      .map(([key, data]): TimelineDataNode => ({ key, ...data }))
  }, [])

  // Highlight markers on map when time node is hovered or selected
  const highlightedPhotoIds = useMemo<Set<string>>((): Set<string> => {
    const activeNode = hoveredTimeNode || selectedTimeNode
    if (!activeNode) return new Set<string>()
    const data = timelineData.find((d: TimelineDataNode): boolean => d.key === activeNode)
    return new Set<string>(data ? data.photos.map((p: PhotoMetadata): string => p.id) : [])
  }, [hoveredTimeNode, selectedTimeNode, timelineData])

  // Leaflet map setup
  useEffect((): (() => void) | void => {
    if (!mapRef.current || mapInstance.current) return

    // Create map
    const map = L.map(mapRef.current, {
      zoomControl: false
    }).setView([25, 10], 2)
    mapInstance.current = map

    // Add zoom control to topright
    L.control.zoom({ position: 'topright' }).addTo(map)

    // Add CartoDB Dark Matter tiles
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
      maxZoom: 20
    }).addTo(map)

    // Add Markers
    const markerGroup = L.featureGroup()
    
    photos.forEach((photo: PhotoMetadata): void => {
      const pinHtml = `
        <div class="pin-wrapper" id="pin-${photo.id}">
          <div class="pin-image-container">
            <img src="${photo.thumbnail}" class="pin-image" alt="Thumbnail" />
          </div>
          <div class="pin-pointer"></div>
        </div>
      `

      const markerIcon = L.divIcon({
        html: pinHtml,
        className: 'custom-photo-pin',
        iconSize: [44, 44],
        iconAnchor: [22, 44]
      })

      const marker = L.marker([photo.lat, photo.lon], { icon: markerIcon })
        .on('click', (): void => {
          setSelectedPhoto(photo)
        })
        .addTo(map)

      markersRef.current[photo.id] = marker
      markerGroup.addLayer(marker)
    })

    // Fit map bounds to markers if we have any and save bounds ref
    if (photos.length > 0) {
      const bounds = markerGroup.getBounds()
      boundsRef.current = bounds
      map.fitBounds(bounds, { padding: [50, 50] })
    }

    return (): void => {
      map.remove()
      mapInstance.current = null
    }
  }, [])

  // Update active visual status for markers when highlightedPhotoIds changes
  useEffect((): void => {
    photos.forEach((photo: PhotoMetadata): void => {
      const pinEl = document.getElementById(`pin-${photo.id}`)
      if (pinEl) {
        if (highlightedPhotoIds.has(photo.id)) {
          pinEl.classList.add('active')
        } else {
          pinEl.classList.remove('active')
        }
      }
    })
  }, [highlightedPhotoIds])

  // Focus map on photo if selected
  useEffect((): void => {
    if (selectedPhoto && mapInstance.current) {
      // Save current state before zooming in
      lastMapStateRef.current = {
        center: mapInstance.current.getCenter(),
        zoom: mapInstance.current.getZoom()
      }
      mapInstance.current.setView([selectedPhoto.lat, selectedPhoto.lon], 10, {
        animate: true
      })
      dialogRef.current?.showModal()
    }
  }, [selectedPhoto])

  // Handle closing the dialog and restoring previous state
  const handleCloseDialog = (): void => {
    dialogRef.current?.close()
    setSelectedPhoto(null)
    if (mapInstance.current && lastMapStateRef.current) {
      mapInstance.current.setView(
        lastMapStateRef.current.center,
        lastMapStateRef.current.zoom,
        { animate: true }
      )
      lastMapStateRef.current = null
    }
  }

  // SVG Timeline config
  const chartHeight = 60
  const chartWidth = 500
  const padding = 20

  const points = useMemo<TimelinePoint[]>((): TimelinePoint[] => {
    if (timelineData.length === 0) return []
    const maxCount = Math.max(...timelineData.map((d: TimelineDataNode): number => d.count))
    const xScale = (chartWidth - padding * 2) / Math.max(1, timelineData.length - 1)
    const yScale = (chartHeight - padding * 2) / Math.max(1, maxCount)

    return timelineData.map((d: TimelineDataNode, index: number): TimelinePoint => ({
      x: padding + index * xScale,
      y: chartHeight - padding - d.count * yScale,
      ...d
    }))
  }, [timelineData])

  const linePath = useMemo<string>((): string => {
    if (points.length === 0) return ''
    return points.reduce((path: string, p: TimelinePoint, i: number): string => {
      return i === 0 ? `M ${p.x} ${p.y}` : `${path} L ${p.x} ${p.y}`
    }, '')
  }, [points])

  const areaPath = useMemo<string>((): string => {
    if (points.length === 0) return ''
    const first = points[0]
    const last = points[points.length - 1]
    return `${linePath} L ${last.x} ${chartHeight - padding} L ${first.x} ${chartHeight - padding} Z`
  }, [points, linePath])

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative' }}>
      {/* Fullscreen Map */}
      <div ref={mapRef} style={{ width: '100%', height: '100%' }} />

      {/* Floating Header */}
      <header
        className="glass-panel"
        style={{
          position: 'absolute',
          top: '20px',
          left: '20px',
          zIndex: 1000,
          padding: '16px 24px',
          borderRadius: '16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '4px',
          pointerEvents: 'auto'
        }}
      >
        <h1 style={{ margin: 0, fontSize: '20px', fontWeight: 600, background: 'linear-gradient(135deg, #c084fc, #67e8f9)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          Explorador de Viajes
        </h1>
        <span style={{ fontSize: '12px', color: '#94a3b8' }}>
          {photos.length} fotos capturadas con metadatos GPS
        </span>
      </header>

      {/* Floating Bottom Timeline Panel */}
      <div
        className="glass-panel"
        style={{
          position: 'absolute',
          bottom: '30px',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 1000,
          padding: '16px 24px',
          borderRadius: '20px',
          width: 'calc(100% - 40px)',
          maxWidth: '560px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          pointerEvents: 'auto'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ margin: 0, fontSize: '14px', fontWeight: 600, color: '#e2e8f0' }}>Línea Temporal de Capturas</h3>
          {selectedTimeNode && (
            <button
              onClick={(): void => setSelectedTimeNode(null)}
              style={{ background: 'none', border: 'none', color: '#06b6d4', fontSize: '11px', cursor: 'pointer', fontWeight: 500, padding: 0 }}
            >
              Limpiar filtro
            </button>
          )}
        </div>

        {/* SVG Custom Spline Chart */}
        <div style={{ width: '100%', height: `${chartHeight}px`, overflow: 'visible' }}>
          <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} width="100%" height="100%" style={{ overflow: 'visible' }}>
            <defs>
              <linearGradient id="timeline-grad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#a855f7" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#a855f7" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Grid Line */}
            <line x1={padding} y1={chartHeight - padding} x2={chartWidth - padding} y2={chartHeight - padding} stroke="rgba(255,255,255,0.1)" strokeWidth="1" />

            {/* Area */}
            {areaPath && <path d={areaPath} fill="url(#timeline-grad)" />}

            {/* Line */}
            {linePath && <path d={linePath} fill="none" stroke="#a855f7" strokeWidth="2.5" />}

            {/* Time Nodes */}
            {points.map((p: TimelinePoint) => {
              const isHovered = hoveredTimeNode === p.key
              const isSelected = selectedTimeNode === p.key
              const radius = isSelected ? 6 : isHovered ? 5 : 4
              const color = isSelected ? '#06b6d4' : isHovered ? '#c084fc' : '#a855f7'
              
              return (
                <g key={p.key}>
                  <circle
                    cx={p.x}
                    cy={p.y}
                    r={radius}
                    fill={color}
                    stroke="#0f172a"
                    strokeWidth="1.5"
                    style={{ cursor: 'pointer', transition: 'r 0.2s, fill 0.2s' }}
                    onMouseEnter={(): void => setHoveredTimeNode(p.key)}
                    onMouseLeave={(): void => setHoveredTimeNode(null)}
                    onClick={(): void => setSelectedTimeNode(isSelected ? null : p.key)}
                  />
                  {/* Tick Label */}
                  <text
                    x={p.x}
                    y={chartHeight - 4}
                    fill={isSelected ? '#06b6d4' : isHovered ? '#e2e8f0' : '#64748b'}
                    fontSize="9"
                    textAnchor="middle"
                    style={{ pointerEvents: 'none', transition: 'fill 0.2s' }}
                  >
                    {p.label}
                  </text>
                </g>
              )
            })}
          </svg>
        </div>
      </div>

      {/* Lightbox Dialog Modal */}
      <dialog
        ref={dialogRef}
        onClose={handleCloseDialog}
        className="glass-panel"
        style={{
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '24px',
          padding: 0,
          maxWidth: '90vw',
          width: '640px',
          outline: 'none',
          color: '#f8fafc',
          overflow: 'hidden'
        }}
      >
        {selectedPhoto && (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {/* Large Display Image */}
            <div style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', background: '#090d16', maxHeight: '70vh', position: 'relative' }}>
              <img
                src={selectedPhoto.display}
                alt={selectedPhoto.filename}
                style={{ width: '100%', height: 'auto', maxHeight: '70vh', objectFit: 'contain', display: 'block' }}
              />
              <button
                onClick={handleCloseDialog}
                style={{
                  position: 'absolute',
                  top: '20px',
                  right: '20px',
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  background: 'rgba(15, 23, 42, 0.7)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  color: '#f8fafc',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '18px',
                  fontWeight: '300',
                  lineHeight: 1,
                  zIndex: 10
                }}
              >
                &times;
              </button>
            </div>

            {/* Meta Details Panel */}
            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <h2 style={{ margin: '0 0 4px 0', fontSize: '18px', fontWeight: 600 }}>{selectedPhoto.filename}</h2>
                <span style={{ fontSize: '13px', color: '#94a3b8' }}>Capturada el {formatDate(selectedPhoto.date)}</span>
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '24px', borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: '16px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  <span style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase' }}>Latitud</span>
                  <span style={{ fontSize: '13px', fontWeight: 500, fontFamily: 'monospace' }}>{selectedPhoto.lat.toFixed(6)}</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  <span style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase' }}>Longitud</span>
                  <span style={{ fontSize: '13px', fontWeight: 500, fontFamily: 'monospace' }}>{selectedPhoto.lon.toFixed(6)}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-end', marginLeft: 'auto' }}>
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${selectedPhoto.lat},${selectedPhoto.lon}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      padding: '10px 18px',
                      background: 'linear-gradient(135deg, #a855f7, #7c3aed)',
                      border: 'none',
                      borderRadius: '12px',
                      color: '#ffffff',
                      fontSize: '12px',
                      fontWeight: 600,
                      textDecoration: 'none',
                      boxShadow: '0 4px 12px rgba(168, 85, 247, 0.3)',
                      transition: 'transform 0.2s',
                      display: 'inline-block'
                    }}
                    onMouseEnter={(e: React.MouseEvent<HTMLAnchorElement>): void => {
                      e.currentTarget.style.transform = 'translateY(-2px)'
                    }}
                    onMouseLeave={(e: React.MouseEvent<HTMLAnchorElement>): void => {
                      e.currentTarget.style.transform = 'translateY(0)'
                    }}
                  >
                    Ver en Google Maps
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}
      </dialog>

      {/* Dialog Backdrop blur css overlay */}
      <style dangerouslySetInnerHTML={{__html: `
        dialog::backdrop {
          background: rgba(8, 10, 18, 0.6);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
        }
      `}} />
    </div>
  )
}

export { App }
