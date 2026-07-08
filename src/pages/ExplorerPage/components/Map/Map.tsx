import { useEffect, type FC } from 'react'
import L from 'leaflet'
import { useExplorer } from '../ExplorerProvider'
import rawMetadata from '../../../../photos-metadata.json'
import type { PhotoMetadata } from '../../../../types'
import './Map.css'

const photos: PhotoMetadata[] = rawMetadata as PhotoMetadata[]

export const Map: FC = () => {
  const { state, actions, meta } = useExplorer()

  // Setup Leaflet Map
  useEffect(() => {
    if (!meta.mapRef.current || meta.mapInstance.current) return

    const map = L.map(meta.mapRef.current, {
      zoomControl: false
    }).setView([25, 10], 2)
    meta.mapInstance.current = map

    L.control.zoom({ position: 'topright' }).addTo(map)

    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
      maxZoom: 20
    }).addTo(map)

    const markerGroup = L.featureGroup()

    photos.forEach((photo) => {
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
        .on('click', () => {
          actions.setSelectedPhoto(photo)
        })
        .addTo(map)

      meta.markersRef.current[photo.id] = marker
      markerGroup.addLayer(marker)
    })

    if (photos.length > 0) {
      const bounds = markerGroup.getBounds()
      meta.boundsRef.current = bounds
      map.fitBounds(bounds, { padding: [50, 50] })
    }

    return () => {
      map.remove()
      meta.mapInstance.current = null
    }
  }, [actions, meta])

  // Highlight markers on state.highlightedPhotoIds change
  useEffect(() => {
    photos.forEach((photo) => {
      const pinEl = document.getElementById(`pin-${photo.id}`)
      if (pinEl) {
        if (state.highlightedPhotoIds.has(photo.id)) {
          pinEl.classList.add('active')
        } else {
          pinEl.classList.remove('active')
        }
      }
    })
  }, [state.highlightedPhotoIds])

  // Center map on selected photo
  useEffect(() => {
    if (state.selectedPhoto && meta.mapInstance.current) {
      meta.lastMapStateRef.current = {
        center: meta.mapInstance.current.getCenter(),
        zoom: meta.mapInstance.current.getZoom()
      }
      meta.mapInstance.current.setView([state.selectedPhoto.lat, state.selectedPhoto.lon], 10, {
        animate: true
      })
      meta.dialogRef.current?.showModal()
    }
  }, [state.selectedPhoto, meta])

  return <div ref={meta.mapRef} className="explorer-map-container" />
}
