import React from 'react'
import { Link } from 'react-router-dom'
import rawMetadata from '../../../../photos-metadata.json'
import './Header.css'

export const Header: React.FC = () => {
  const photoCount = rawMetadata.length

  return (
    <header className="glass-panel explorer-header">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', gap: '40px' }}>
        <div>
          <h1>Explorador de Viajes</h1>
          <span>{photoCount} fotos capturadas con metadatos GPS</span>
        </div>
        <Link to="/upload" style={{
          padding: '8px 14px',
          background: 'rgba(255,255,255,0.06)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '10px',
          color: '#e2e8f0',
          fontSize: '11px',
          fontWeight: 600,
          textDecoration: 'none',
          whiteSpace: 'nowrap'
        }}>
          Cargar Foto
        </Link>
      </div>
    </header>
  )
}
