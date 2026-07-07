import type React from 'react'
import { Link } from 'react-router-dom'
import './UploadPage.css'

export const UploadPage: React.FC = () => {
  return (
    <div className="upload-page-layout">
      <div className="glass-panel upload-card">
        <h2 className="upload-title">
          Cargar Foto a Vercel
        </h2>
        <p className="upload-description">
          Esta pantalla es un placeholder de la opción de carga. En el futuro podrás subir tus fotos con GPS extraído directamente en el cliente.
        </p>
        <div className="upload-btn-container">
          <button className="upload-btn-placeholder" onClick={() => alert('¡Pronto disponible!')}>
            Subir Imagen (Simulado)
          </button>
        </div>
        <Link to="/" className="back-link">
          &larr; Volver al Explorador
        </Link>
      </div>
    </div>
  )
}
