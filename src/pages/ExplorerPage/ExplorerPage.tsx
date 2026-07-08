import type React from 'react'
import { ExplorerProvider } from './components/ExplorerProvider'
import { Map } from './components/Map'
import { Header } from './components/Header'
import { Timeline } from './components/Timeline'
import { Lightbox } from './components/Lightbox'
import './ExplorerPage.css'

export const ExplorerPage: React.FC = () => {
  return (
    <ExplorerProvider>
      <div className="explorer-page-layout">
        <Map />
        <Header />
        <Timeline />
        <Lightbox />
      </div>
    </ExplorerProvider>
  )
}
