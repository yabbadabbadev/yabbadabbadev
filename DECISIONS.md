# Registro de Decisiones de Arquitectura (Decision Guards)

Este documento registra decisiones de diseño deliberadas en este repositorio que pueden parecer subóptimas o erróneas a primera vista, pero que tienen una justificación técnica o de negocio importante.

**Regla para Agentes de IA:**
- Si encuentras un comentario con el prefijo `// DEC-XXX` en el código, DEBES buscar su identificador en este archivo y respetar la lógica descrita antes de sugerir o realizar cualquier modificación.

---

## DEC-001
- **Ubicación**: `src/__tests__/App.test.tsx`
- **Tema**: Validación exacta del encabezado de la App.
- **Justificación**: El encabezado de Hello World con tres signos de exclamación `!!!` es el branding definido por el boilerplate; los tests deben reflejar exactamente este string.
