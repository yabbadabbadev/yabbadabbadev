# Especificación de Diseño: Optimización de Repositorio para Agentes de IA

Este documento describe la especificación técnica y de configuración para hacer que el repositorio `react-boilerplate` sea óptimo para el uso autónomo y colaborativo por parte de agentes de IA, adoptando los patrones de Lada Kesseler y Lexler.

---

## 1. Contexto y Objetivos

- **Estado Actual**: Repositorio boilerplate de React + TypeScript + Vite + Vitest + MSW. Cuenta con un test que falla en `src/__tests__/App.test.tsx` debido a una discrepancia de exclamaciones.
- **Objetivos**:
  - Establecer **Ground Rules** a través de `AGENTS.md` para guiar el comportamiento de los agentes.
  - Implementar **Decision Guards** a través de `DECISIONS.md` para proteger decisiones contrarias a la intuición.
  - Corregir el test roto actual para garantizar una línea base limpia y lista para flujos TDD.

---

## 2. Especificación Técnica

### 2.1. Creación de `AGENTS.md` (Ground Rules)
Se creará un archivo en la raíz llamado `AGENTS.md` con las reglas estrictas de desarrollo:
- **TypeScript**: Tipado explícito requerido, sin uso libre de `any`.
- **TDD (Test-Driven Development)**: Requisito de seguir el flujo Red-Green-Refactor escribiendo la prueba antes que la implementación.
- **MSW**: Reglas específicas sobre cómo estructurar controladores y simular APIs.
- **Arquitectura**: Componentes aislados de lógica mediante Custom Hooks y límites de tamaño de archivo (150 líneas).
- **Decision Guards**: Consultar siempre `DECISIONS.md` cuando se encuentre una referencia `// DEC-XXX`.

### 2.2. Creación de `DECISIONS.md` (Decision Guards)
Se creará `DECISIONS.md` en la raíz con el formato:
- Identificador `DEC-XXX`
- Ubicación del código
- Razón o trade-off detrás de la decisión.
Se registrará la primera decisión `DEC-001` sobre el test de `App.test.tsx`.

### 2.3. Corrección del Test de Referencia
Se modificará `src/__tests__/App.test.tsx` para corregir la expectativa de exclamaciones de `'Hello World!!'` a `'Hello World!!!'` y se le añadirá el comentario de guardia `// DEC-001`.

---

## 3. Plan de Verificación

1. **Pruebas de Unidad**: Ejecutar `npm test -- --run` para verificar que la suite de pruebas unitarias pasa correctamente (100% verde).
2. **Linting & Compilación**: Ejecutar `npm run lint` y `npm run build` para asegurar que el formateo, tipos de TypeScript y build general no tienen errores.
