import type React from 'react'
import { useExplorer } from '../ExplorerProvider'
import './Lightbox.css'

export const Lightbox: React.FC = () => {
  const { state, actions, meta } = useExplorer()

  const formatDate = (dateStr: string): string => {
    const d = new Date(dateStr)
    return d.toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })
  }

  const handleCloseDialog = (): void => {
    meta.dialogRef.current?.close()
    actions.setSelectedPhoto(null)
    if (meta.mapInstance.current && meta.lastMapStateRef.current) {
      meta.mapInstance.current.setView(
        meta.lastMapStateRef.current.center,
        meta.lastMapStateRef.current.zoom,
        { animate: true }
      )
      meta.lastMapStateRef.current = null
    }
  }

  return (
    <>
      <dialog ref={meta.dialogRef} onClose={handleCloseDialog} className="glass-panel lightbox-dialog">
        {state.selectedPhoto ? (
          <div className="lightbox-wrapper">
            <div className="lightbox-image-container">
              <img
                src={state.selectedPhoto.display}
                alt={state.selectedPhoto.filename}
                className="lightbox-img"
              />
              <button onClick={handleCloseDialog} className="lightbox-close-btn">
                &times;
              </button>
            </div>

            <div className="lightbox-details">
              <div className="lightbox-title-section">
                <h2>{state.selectedPhoto.filename}</h2>
                <span>Capturada el {formatDate(state.selectedPhoto.date)}</span>
              </div>

              <div className="lightbox-grid-section">
                <div className="lightbox-data-col">
                  <span className="lightbox-label">Latitud</span>
                  <span className="lightbox-value">{state.selectedPhoto.lat.toFixed(6)}</span>
                </div>
                <div className="lightbox-data-col">
                  <span className="lightbox-label">Longitud</span>
                  <span className="lightbox-value">{state.selectedPhoto.lon.toFixed(6)}</span>
                </div>
                <div className="lightbox-action-col">
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${state.selectedPhoto.lat},${state.selectedPhoto.lon}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="lightbox-maps-link"
                  >
                    Ver en Google Maps
                  </a>
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </dialog>

      {/* Dialog backdrop overlay global rule */}
      <style dangerouslySetInnerHTML={{__html: `
        dialog::backdrop {
          background: rgba(8, 10, 18, 0.6);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
        }
      `}} />
    </>
  )
}
