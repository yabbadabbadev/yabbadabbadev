import type React from 'react'
import { Link } from 'react-router-dom'
import rawMetadata from '../../../../photos-metadata.json'
import './Header.css'

export const Header: React.FC = () => {
  const photoCount = rawMetadata.length

  return (
    <header className="glass-panel explorer-header">
      <div className="explorer-header-container">
        <div>
          <h1>Explorador de Viajes</h1>
          <span>{photoCount} fotos capturadas con metadatos GPS</span>
        </div>
        <Link to="/upload" className="upload-link">
          Cargar Foto
        </Link>
      </div>
    </header>
  )
}
