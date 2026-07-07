import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { ExplorerPage } from './pages/ExplorerPage'
import { UploadPage } from './pages/UploadPage'

export const App = (): React.ReactElement => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<ExplorerPage />} />
        <Route path="/upload" element={<UploadPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
