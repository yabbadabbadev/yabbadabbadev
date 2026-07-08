import { render, screen, fireEvent } from '@testing-library/react'
import { UploadPage } from '../UploadPage'
import { MemoryRouter } from 'react-router-dom'
import { expect, vi, describe, it } from 'vitest'

describe('UploadPage', () => {
  it('renders correctly and has all key elements', () => {
    render(
      <MemoryRouter>
        <UploadPage />
      </MemoryRouter>
    )

    // Check title
    expect(screen.getByRole('heading', { name: 'Cargar Foto a Vercel', level: 2 })).toBeInTheDocument()

    // Check description
    expect(
      screen.getByText(/Esta pantalla es un placeholder de la opción de carga/i)
    ).toBeInTheDocument()

    // Check simulated button
    const button = screen.getByRole('button', { name: 'Subir Imagen (Simulado)' })
    expect(button).toBeInTheDocument()

    // Check back link
    const link = screen.getByRole('link', { name: /Volver al Explorador/i })
    expect(link).toBeInTheDocument()
    expect(link).toHaveAttribute('href', '/')
  })

  it('triggers alert when clicking the upload button', () => {
    const alertMock = vi.spyOn(window, 'alert').mockImplementation(() => {})

    render(
      <MemoryRouter>
        <UploadPage />
      </MemoryRouter>
    )

    const button = screen.getByRole('button', { name: 'Subir Imagen (Simulado)' })
    fireEvent.click(button)

    expect(alertMock).toHaveBeenCalledWith('¡Pronto disponible!')
    alertMock.mockRestore()
  })
})
