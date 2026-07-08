import type React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { ExplorerPage } from './pages/ExplorerPage'
import { UploadPage } from './pages/UploadPage'

const App = (): React.ReactElement => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<ExplorerPage />} />
        <Route path="/upload" element={<UploadPage />} />
      </Routes>
    </Router>
  )
}

export { App }

